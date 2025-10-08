/**
 * Elegant Batch Processor
 * Combines the best ideas: shared data preparation + lodash filtering + register pattern
 */
import { flatMap, groupBy, map, uniqBy } from 'lodash';
import { Template } from 'app/apiResponseTypes';
import { ClientTranslationContextSchema, ClientTranslationSchema } from 'app/istore';
import { Entity } from 'app/V2/domain';
import { EntitySchema } from 'shared/types/entityType';
import { PropertySchema } from 'shared/types/commonTypes';
import { ensure } from 'shared/tsUtils';
import { 
  FormattedProperty, 
  BatchProcessingContext, 
  ProcessingError 
} from './PropertyStructure';

interface ComposerSharedData {
  options: any;
  language: string;
  translations: ClientTranslationSchema[];
  settings: any;
  templates: Template[];
  dateFormatting: {
    format: string;
    timezone?: string;
    includeTime: boolean;
    relativeTime: boolean;
    locale: string;
  };
  selectFormatting: {
    showLabels: boolean;
    showIcons: boolean;
    showUrls: boolean;
    includeOptions: boolean;
  };
  relationshipFormatting: {
    nestedLevel: number;
    includeEntityData: boolean;
    includeTemplates: boolean;
    maxRelationships: number;
  };
  fileFormatting: {
    includeFileMetadata: boolean;
    includeThumbnails: boolean;
    maxFileSize: number;
    allowedTypes: string[];
  };
  geolocationFormatting: {
    precision: number;
    format: string;
    includeMapData: boolean;
    combineGeolocation: boolean;
  };
}

export interface PropertyTypeProcessor {
  readonly name: string;
  readonly priority: number;
  readonly propertyTypes: string[];
  
  processBatch(
    properties: any[],
    sharedData: any,
    context: BatchProcessingContext
  ): Promise<Map<string, FormattedProperty>>;
}

export class ElegantBatchProcessor {
  private readonly context: BatchProcessingContext;
  private readonly processors: Map<string, PropertyTypeProcessor> = new Map();
  private sharedData: ComposerSharedData | null = null;

  constructor(context: BatchProcessingContext) {
    this.context = context;
  }

  /**
   * Register a processor for specific property types
   */
  registerProcessor(processor: PropertyTypeProcessor): void {
    // Initialize processor with context if it has initialize method
    if ('initialize' in processor && typeof processor.initialize === 'function') {
      (processor as any).initialize(this.context);
    }
    
    processor.propertyTypes.forEach(type => {
      this.processors.set(type, processor);
    });
  }

  /**
   * Step 1: Prepare ALL shared data first
   * This includes definitions, metadata, utilities, translations, etc.
   */
  private prepareAllSharedData() {
    const { options, language, translations, settings, templates } = this.context;
    
    this.sharedData = {
      // Date formatting utilities
      dateFormatting: {
        format: options.dateOptions?.dateFormat || options.dateFormat || settings?.dateFormat || 'YYYY-MM-DD',
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

  /**
   * Step 2: Collect properties by type using lodash filtering
   * Much more efficient than manual iteration
   */
  private collectPropertiesByType(entities: Partial<Entity>[]): Map<string, any[]> {
    const propertiesByType = new Map<string, any[]>();
    
    const allProperties = flatMap(entities, entity => 
      map(entity.metadata || {}, property => ({
        ...property,
        _entityId: entity._id,
        entity,
      }))
    );

    const groupedProperties = groupBy(allProperties, 'type');
    
    Object.entries(groupedProperties).forEach(([type, properties]) => {
      propertiesByType.set(type, properties);
    });

    return propertiesByType;
  }

  /**
   * Step 3: Process all entities with elegant batch processing
   */
  async processAllEntities(entities: any[]): Promise<{
    entities: any[];
    processedProperties: Map<string, Map<string, FormattedProperty>>;
    errors: ProcessingError[];
    totalProcessingTime: number;
    batchStats: {
      totalProperties: number;
      propertiesByType: Record<string, number>;
      sharedDataPrepared: string[];
      processorsUsed: string[];
    };
  }> {
    const startTime = Date.now();
    const allErrors: ProcessingError[] = [];
    const allProcessedProperties = new Map<string, Map<string, FormattedProperty>>();
    
    // Initialize result entities
    const resultEntities = entities.map(entity => ({ ...entity }));

    let propertiesByType: Map<string, any[]> | null = new Map();
    try {
      this.prepareAllSharedData();
      ensure(this.sharedData, 'Shared data not prepared');
      const templatesIds = uniqBy(entities, 'template');
      // Step 1: Format template data
      const templatesData = this.formatTemplateData(templatesIds);
      const templatesById = new Map<string, Template>();
      templatesData.forEach(template => {
        templatesById.set(template._id, template as Template);
      });
  
      const formattedEntities = entities.map(entity => ({ 
        _id: entity._id,
        title: entity.title,
        template: templatesById.get(entity.template),
        rawEntity:entity,
      }));

      // Step 2: Collect properties by type using lodash filtering
      propertiesByType = this.collectPropertiesByType(formattedEntities as Partial<Entity>[]);
    
      // Step 3: Process each property type in batch
      const batchResults = await this.processPropertiesByType(propertiesByType);
      
      // Step 4: Inject results back to entities
      this.injectResultsToEntities(batchResults);
      

    } catch (error) {
      allErrors.push({
        field: 'elegant_batch',
        error: error instanceof Error ? error.message : 'Elegant batch processing error',
        timestamp: new Date(),
      });
    }

    const totalProcessingTime = Date.now() - startTime;
    const batchStats = this.calculateBatchStats(propertiesByType);

    return {
      entities: resultEntities,
      processedProperties: allProcessedProperties,
      errors: allErrors,
      totalProcessingTime,
      batchStats,
    };
  }

  formatTemplateData(templatesIds: any[]) {
    const sharedData = this.sharedData!;
    return sharedData.templates.filter((template: Template) => templatesIds.includes(template.id)).map((template: Template) => {
      const templateTranslations = sharedData.options.translateFields ? sharedData.translations.find(t=>t.locale===sharedData.language)?.contexts.find(t=>t._id===template._id) : undefined;
      const properties = template.properties?.filter(property => sharedData.options.includeFields.includes(property.name));
      const formattedProperties = properties?.map(property=> this.formatPropertyDefinition(property, templateTranslations));
      const commonProperties = template.properties?.filter(property => sharedData.options.includeFields.includes(property.name));
      const formattedCommonProperties = commonProperties?.map(property=> this.formatPropertyDefinition(property, templateTranslations));
      return {
        _id: template._id,
        name: template.name,
        label: template.label,
        ...(templateTranslations? {translatedLabel: templateTranslations.values[template.name]} : {}),
        color: template.color,
        entityViewPage: template.entityViewPage,
        commonProperties: formattedCommonProperties,
        properties: formattedProperties,
      }
    });
  }
  
  formatPropertyDefinition (property: PropertySchema, templateTranslations?: ClientTranslationContextSchema) {
          return {
            _id: property._id,
            name: property.name,
            label: property.label,
            type: property.type,
            ...(templateTranslations ? {
              translatedLabel: templateTranslations.values[property.name]
            } : {}),
          };
        }
    filterPropertiesToProcess(entities: EntitySchema[], sharedData: ComposerSharedData) {
        if (sharedData.options.includeFields){
          return sharedData.options.includeFields;
        }else {
          return sharedData.templates.map(template => template.name); 
        }
    }

  /**
   * Step 3: Process properties by type using registered processors
   */
  private async processPropertiesByType(
    propertiesByType: Map<string, any[]>,
  ): Promise<Map<string, FormattedProperty>> {
    const sharedData = ensure(this.sharedData, 'Shared data not prepared');
    const allResults = new Map<string, FormattedProperty>();
    const processorsUsed: string[] = [];

    for (const [propertyType, properties] of propertiesByType) {
      const processor = this.processors.get(propertyType);
      
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

  /**
   * Step 4: Inject results back to entities
   */
  private injectResultsToEntities(
    batchResults: Map<string, FormattedProperty>,
  ): void {
    batchResults.forEach((property, key) => {
      property.entity.metadata[key] = property;
    });
  }

  /**
   * Calculate batch processing statistics
   */
  private calculateBatchStats(propertiesByType: Map<string, any[]>): {
    totalProperties: number;
    propertiesByType: Record<string, number>;
    sharedDataPrepared: string[];
    processorsUsed: string[];
  } {
    const totalProperties = Array.from(propertiesByType.values()).reduce((sum, props) => sum + props.length, 0);
    const propertiesByTypeCount: Record<string, number> = {};
    
    propertiesByType.forEach((properties, type) => {
      propertiesByTypeCount[type] = properties.length;
    });

    return {
      totalProperties,
      propertiesByType: propertiesByTypeCount,
      sharedDataPrepared: Object.keys(this.sharedData || {}),
      processorsUsed: Array.from(this.processors.keys()),
    };
  }
}
