import { flatMap, groupBy, map, uniq } from 'lodash';
import { Template } from 'app/apiResponseTypes';
import { ClientTranslationContextSchema } from 'app/istore';
import { Entity } from 'app/V2/domain';
import { ComposedTemplate } from 'app/V2/domain/entities/types';
import { PropertySchema } from 'shared/types/commonTypes';
import { ensure } from 'shared/tsUtils';
import {
  FormattedProperty,
  ProcessingContext,
  ProcessingError,
  PropertyTypeProcessor,
} from './types';

export class EntityAdapterProcessor {
  private readonly context: ProcessingContext;
  private readonly processors: Map<string, PropertyTypeProcessor> = new Map();

  constructor(context: ProcessingContext) {
    this.context = context;
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

      const templatesData = this.formatTemplateData(templatesIds);
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
        entity.metadata.push(property);
      });
    } catch (error) {
      allErrors.push({
        field: 'EntityAdapterProcessor',
        error: error instanceof Error ? error.message : 'EntityAdapterProcessor error',
        timestamp: new Date(),
      });
    }

    const composedEntities = formattedEntities.map(({ rawEntity, ...restEntity }) => {
      const { template, ...entity } = restEntity;
      if (template) {
        const { properties, commonProperties, ...restTemplate } = template;
        return {
          ...entity,
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

  formatTemplateData(templatesIds: string[]): ComposedTemplate[] {
    return this.context.templates
      .filter((template: Template) => templatesIds.includes(template._id))
      .map((template: Template) => {
        const templateTranslations = this.context.options.translateLabels && this.context.translations
          ? this.context.translations
            .find(t => t.locale === this.context.language)
            ?.contexts.find(t => t._id === template._id)
          : undefined;

        const commonProperties = this.context.options.includeFields
          ? template.commonProperties?.filter(property =>
            this.context.options.includeFields?.includes(property.name)
          )
          : template.commonProperties;
        const formattedCommonProperties = new Map<string, any>();
        const formattedProperties = new Map<string, any>();

        const properties = this.context.options.includeFields
          ? template.properties?.filter(property =>
            this.context.options.includeFields?.includes(property.name)
          )
          : template.properties;

        properties?.forEach(property =>
          formattedProperties.set(
            property.name,
            this.formatPropertyDefinition(property, templateTranslations)
          )
        );
        commonProperties?.forEach(property =>
          formattedCommonProperties.set(
            property.name,
            this.formatPropertyDefinition(property, templateTranslations)
          )
        );
        return {
          _id: template._id,
          name: template.name,
          ...(templateTranslations
            ? { translatedLabel: templateTranslations.values[template.name] }
            : {}),

          label: (template.label || '') as string,
          color: (template.color || '') as string,
          entityViewPage: (template.entityViewPage || '') as string,
          commonProperties: formattedCommonProperties,
          properties: formattedProperties,
        };
      });
  }

  formatPropertyDefinition(
    property: PropertySchema,
    templateTranslations?: ClientTranslationContextSchema
  ) {
    return {
      _id: property._id,
      name: property.name,
      label: property.label,
      type: property.type,
      ...(templateTranslations
        ? {
          translatedLabel: templateTranslations.values[property.name],
        }
        : {}),
    };
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
