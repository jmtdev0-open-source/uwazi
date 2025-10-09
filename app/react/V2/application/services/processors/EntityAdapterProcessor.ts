import { flatMap, groupBy, map, uniq } from 'lodash';
import { Template } from 'app/apiResponseTypes';
import { ClientTranslationContextSchema } from 'app/istore';
import { Entity } from 'app/V2/domain';
import { ComposedTemplate } from 'app/V2/domain/entities/types';
import { PropertySchema } from 'shared/types/commonTypes';
import { ensure } from 'shared/tsUtils';
import {
  FormattedProperty,
  AdapterProcessingContext,
  ProcessingError,
  ComposerSharedData,
  PropertyTypeProcessor,
} from './types';

export class EntityAdapterProcessor {
  private readonly context: AdapterProcessingContext;
  private readonly processors: Map<string, PropertyTypeProcessor> = new Map();
  private sharedData: ComposerSharedData | null = null;

  constructor(context: AdapterProcessingContext) {
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

  private prepareAllSharedData() {
    const { options, language, translations, settings, templates } = this.context;

    this.sharedData = {
      dateFormatting: {
        format:
          options.dateOptions?.dateFormat ||
          options.dateFormat ||
          settings?.dateFormat ||
          'YYYY-MM-DD',
        timezone: options.dateOptions?.timezone,
        includeTime: options.dateOptions?.includeTime || false,
        relativeTime: options.dateOptions?.relativeTime || false,
        locale: options.dateOptions?.locale || language,
      },

      // Select formatting utilities
      selectFormatting: {
        showLabels: options.selectOptions?.showLabels !== false,
        showIcons: options.selectOptions?.showIcons || false,
        showUrls: options.selectOptions?.showUrls || false,
        includeOptions: options.selectOptions?.includeOptions || false,
      },

      // Relationship formatting utilities
      relationshipFormatting: {
        nestedLevel: options.relationshipOptions?.nestedLevel || 1,
        includeEntityData: options.relationshipOptions?.includeEntityData || false,
        includeTemplates: options.relationshipOptions?.includeTemplates || false,
        maxRelationships: options.relationshipOptions?.maxRelationships,
      },

      // File formatting utilities
      fileFormatting: {
        includeFileMetadata: options.fileOptions?.includeFileMetadata || false,
        includeThumbnails: options.fileOptions?.includeThumbnails || false,
        maxFileSize: options.fileOptions?.maxFileSize,
        allowedTypes: options.fileOptions?.allowedTypes,
      },

      // Geolocation formatting utilities
      geolocationFormatting: {
        precision: options.geolocationOptions?.precision || 4,
        format: options.geolocationOptions?.format || 'decimal',
        includeMapData: options.geolocationOptions?.includeMapData || false,
        combineGeolocation: options.geolocationOptions?.combineGeolocation || false,
      },

      // Shared data
      translations,
      settings,
      templates,
      language,
      options,
    };
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
      this.prepareAllSharedData();
      ensure(this.sharedData, 'Shared data not prepared');
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
      const { properties, commonProperties, ...restTemplate } = template;
      return {
        ...entity,
        template: restTemplate,
      };
    });
    return {
      entities: composedEntities,
      errors: allErrors,
    };
  }

  formatTemplateData(templatesIds: string[]): ComposedTemplate[] {
    const sharedData = this.sharedData!;
    return sharedData.templates
      .filter((template: Template) => templatesIds.includes(template._id))
      .map((template: Template) => {
        const templateTranslations = sharedData.options.translateFields
          ? sharedData.translations
              .find(t => t.locale === sharedData.language)
              ?.contexts.find(t => t._id === template._id)
          : undefined;

        const commonProperties = sharedData.options.includeFields
          ? template.commonProperties?.filter(property =>
              sharedData.options.includeFields.includes(property.name)
            )
          : template.commonProperties;
        const formattedCommonProperties = new Map<string, any>();
        const formattedProperties = new Map<string, any>();

        const properties = sharedData.options.includeFields
          ? template.properties?.filter(property =>
              sharedData.options.includeFields.includes(property.name)
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
          label: template.label,
          ...(templateTranslations
            ? { translatedLabel: templateTranslations.values[template.name] }
            : {}),
          color: template.color,
          entityViewPage: template.entityViewPage,
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
    const sharedData: ComposerSharedData = ensure(this.sharedData, 'Shared data not prepared');
    const allResults = new Map<string, FormattedProperty>();
    const processorsUsed: string[] = [];

    for (const [propertyType, properties] of propertiesByType) {
      const processor = this.processors.get(propertyType) || this.processors.get('any');

      if (processor && properties.length > 0) {
        try {
          const results = await processor.processBatch(properties, sharedData, this.context);

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
