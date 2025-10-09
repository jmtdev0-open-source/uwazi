import { flatMap, groupBy, map, sortBy, uniq } from 'lodash';
import { Entity } from 'app/V2/domain';
import { ComposedTemplate } from 'app/V2/domain/entities/types';
import { ensure } from 'shared/tsUtils';
import {
  FormattedProperty,
  ProcessingContext,
  ProcessingError,
  PropertyTypeProcessor,
} from './types';
import { AdapterTemplateProcessor } from './AdapterTemplateProcessor';

export class EntityAdapterProcessor {
  private readonly context: ProcessingContext;
  private readonly processors: Map<string, PropertyTypeProcessor> = new Map();
  private readonly templateProcessor: AdapterTemplateProcessor;

  constructor(context: ProcessingContext) {
    this.context = context;
    this.templateProcessor = new AdapterTemplateProcessor(context);
  }

  registerProcessor(processor: PropertyTypeProcessor): void {
    if ('initialize' in processor && typeof processor.initialize === 'function') {
      (processor as any).initialize(this.context);
    }

    processor.propertyTypes.forEach(type => {
      this.processors.set(type, processor);
    });
  }

  private collectPropertiesByType(entities: Partial<Entity>[]): Map<string, any[]> {
    const propertiesByType = new Map<string, any[]>();

    const allProperties = flatMap(entities, entity =>
      map(Object.entries(entity.rawEntity?.metadata || {}), ([name, property]) => {
        return {
          value: property,
          _entityId: entity._id,
          entity,
          ...(entity.template?.properties.get(name) || {}),
        };
      })
    );

    const groupedProperties = groupBy(allProperties, 'type');

    Object.entries(groupedProperties).forEach(([type, properties]) => {
      propertiesByType.set(type, properties);
    });

    return propertiesByType;
  }

  async processEntity(entity: any): Promise<{
    entity: Entity;
    errors: ProcessingError[];
  }> {
    const result = await this.processAllEntities([entity]);
    return {
      entity: result.entities[0],
      errors: result.errors,
    };
  }

  async processAllEntities(entities: any[]): Promise<{
    entities: Entity[];
    errors: ProcessingError[];
  }> {
    const allErrors: ProcessingError[] = [];
    let formattedEntities: any[] = [];
    const resultEntities = entities.map(entity => ({ ...entity }));

    let propertiesByType: Map<string, any[]> | null = new Map();
    try {
      const templatesIds = uniq(entities.map(entity => entity.template));

      const templatesData = this.templateProcessor.formatTemplateData(templatesIds);
      const templatesById = new Map<string, ComposedTemplate>();
      templatesData.forEach(template => {
        templatesById.set(template._id, template);
      });

      formattedEntities = resultEntities.map(entity => ({
        _id: entity._id,
        title: entity.title,
        template: templatesById.get(entity.template),
        rawEntity: entity,
        metadata: [],
      }));

      propertiesByType = this.collectPropertiesByType(formattedEntities as Partial<Entity>[]);

      const batchResults = await this.processPropertiesByType(propertiesByType);

      batchResults.forEach(({ entity, rawEntity, ...property }) => {
        entity.metadata.splice(property.index, 0, property);
      });
    } catch (error) {
      allErrors.push({
        field: 'EntityAdapterProcessor',
        error: error instanceof Error ? error.message : 'EntityAdapterProcessor error',
        timestamp: new Date(),
      });
    }

    const composedEntities = formattedEntities.map(({ rawEntity, ...restEntity }) => {
      const { template, metadata, ...entity } = restEntity;
      if (template) {
        const { properties, commonProperties, ...restTemplate } = template;
        return {
          ...entity,
          metadata: sortBy(metadata, 'index'),
          template: restTemplate,
        };
      }
      return {
        ...entity,
        template: null,
      };
    });
    return {
      entities: composedEntities,
      errors: allErrors,
    };
  }

  // Template processing moved to AdapterTemplateProcessor
  private formatTemplateData(templatesIds: string[]): ComposedTemplate[] {
    return this.templateProcessor.formatTemplateData(templatesIds);
  }

  private async processPropertiesByType(
    propertiesByType: Map<string, any[]>
  ): Promise<Map<string, FormattedProperty>> {
    const allResults = new Map<string, FormattedProperty>();
    const processorsUsed: string[] = [];

    for (const [propertyType, properties] of propertiesByType) {
      const processor = this.processors.get(propertyType) || this.processors.get('any');

      if (processor && properties.length > 0) {
        try {
          const results = await processor.processBatch(properties, this.context);

          results.forEach((property, key) => {
            allResults.set(key, property);
          });

          processorsUsed.push(processor.name);
        } catch (error) {
          console.error(`Error processing ${propertyType} properties:`, error);
        }
      }
    }

    return allResults;
  }
}
