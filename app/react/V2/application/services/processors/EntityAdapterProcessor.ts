import { flatMap, groupBy, map, sortBy } from 'lodash';
import { Entity } from 'app/V2/domain';
import { ComposedProperty, ComposedTemplate } from 'app/V2/domain/entities/types';
import {
  FormattedProperty,
  ProcessingContext,
  ProcessingError,
  PropertyTypeProcessor,
} from './types';
import { AdapterTemplateProcessor } from './AdapterTemplateProcessor';
import { AdapterDateProcessor } from './AdapterDateProcessor';
import { AdapterSelectProcessor } from './AdapterSelectProcessor';
import { GeolocationProcessor } from './GeolocationProcessor';
import { RelationshipProcessor } from './RelationshipProcessor';
import { FileProcessor } from './FileProcessor';
import { DefaultPropertyProcessor } from './DefaultPropertyProcessor';
import { EntitySchema } from 'api/migrations/migrations/143-parse-numeric-fields/types';

export class EntityAdapterProcessor {
  private readonly context: ProcessingContext;
  private readonly processors: Map<string, PropertyTypeProcessor> = new Map();
  private readonly templateProcessor: AdapterTemplateProcessor;

  constructor(context: ProcessingContext) {
    this.context = context;
    this.templateProcessor = new AdapterTemplateProcessor(context);

    this.initializeProcessors();
  }

  private initializeProcessors(): void {
    const dateProcessor = new AdapterDateProcessor();
    const selectProcessor = new AdapterSelectProcessor();
    const geolocationProcessor = new GeolocationProcessor();
    const relationshipProcessor = new RelationshipProcessor();
    const fileProcessor = new FileProcessor();
    const defaultProcessor = new DefaultPropertyProcessor();

    dateProcessor.propertyTypes.forEach(type => this.processors.set(type, dateProcessor));
    selectProcessor.propertyTypes.forEach(type => this.processors.set(type, selectProcessor));
    geolocationProcessor.propertyTypes.forEach(type =>
      this.processors.set(type, geolocationProcessor)
    );
    relationshipProcessor.propertyTypes.forEach(type =>
      this.processors.set(type, relationshipProcessor)
    );
    fileProcessor.propertyTypes.forEach(type => this.processors.set(type, fileProcessor));

    this.processors.set('any', defaultProcessor);
  }

  private collectPropertiesByType(entities: Partial<Entity>[]): Map<string, any[]> {
    const propertiesByType = new Map<string, ComposedProperty[]>();

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
      propertiesByType.set(type, properties as ComposedProperty[]);
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

  async processAllEntities(entities: EntitySchema[]): Promise<{
    entities: Entity[];
    errors: ProcessingError[];
  }> {
    const allErrors: ProcessingError[] = [];
    let formattedEntities: any[] = [];
    const resultEntities = entities.map(entity => ({ ...entity }));

    let propertiesByType: Map<string, any[]> | null = new Map();
    try {
      const templateIds = entities.map(entity => entity.template as string);
      const templatesData = this.templateProcessor.formatTemplateData(templateIds);
      const templatesById = new Map<string, ComposedTemplate>();

      templatesData.forEach(template => {
        templatesById.set(template._id, template);
      });

      formattedEntities = resultEntities.map(entity => ({
        _id: entity._id,
        title: entity.title,
        template: templatesById.get(entity.template as string),
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
        entityId: 'batch',
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

  private async processPropertiesByType(
    propertiesByType: Map<string, any[]>
  ): Promise<Map<string, FormattedProperty>> {
    const allResults = new Map<string, FormattedProperty>();

    await Promise.all(
      Array.from(propertiesByType.entries()).map(async ([propertyType, properties]) => {
        const processor = this.processors.get(propertyType) || this.processors.get('any');
        if (processor && properties.length > 0) {
          const results = await processor.processBatch(properties, this.context);
          results.forEach((property, key) => {
            allResults.set(key, property);
          });
        }
      })
    );

    return allResults;
  }
}
