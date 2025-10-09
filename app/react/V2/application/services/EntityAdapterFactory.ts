import { CompositionOptions } from 'app/V2/domain';
import { EntityAdapterProcessor } from './processors/EntityAdapterProcessor';
import { AdapterDateProcessor } from './processors/AdapterDateProcessor';
import { AdapterSelectProcessor } from './processors/AdapterSelectProcessor';
import { ProcessingContext } from './processors/types';

export class EntityAdapterFactory {
  private static createProcessingContext(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      settings: any;
      templates: any;
      translations: any;
    }
  ): ProcessingContext {
    return {
      options,
      language: context.language,
      userId: context.userId,
      userPermissions: context.userPermissions,
      translations: context.translations || [],
      settings: context.settings,
      templates: context.templates || [],
      // Pre-calculate formatting utilities
      dateFormatting: {
        format:
          options.dateOptions?.dateFormat ||
          options.dateFormat ||
          context.settings?.dateFormat ||
          'YYYY-MM-DD',
        timezone: options.dateOptions?.timezone,
        includeTime: options.dateOptions?.includeTime || false,
        relativeTime: options.dateOptions?.relativeTime || false,
        locale: options.dateOptions?.locale || context.language,
      },
      selectFormatting: {
        showLabels: options.selectOptions?.showLabels !== false,
        showIcons: options.selectOptions?.showIcons || false,
        showUrls: options.selectOptions?.showUrls || false,
        includeOptions: options.selectOptions?.includeOptions || false,
      },
      relationshipFormatting: {
        nestedLevel: options.relationshipOptions?.nestedLevel || 1,
        includeEntityData: options.relationshipOptions?.includeEntityData || false,
        includeTemplates: options.relationshipOptions?.includeTemplates || false,
        maxRelationships: options.relationshipOptions?.maxRelationships,
      },
      fileFormatting: {
        includeFileMetadata: options.fileOptions?.includeFileMetadata || false,
        includeThumbnails: options.fileOptions?.includeThumbnails || false,
        maxFileSize: options.fileOptions?.maxFileSize,
        allowedTypes: options.fileOptions?.allowedTypes,
      },
      geolocationFormatting: {
        precision: options.geolocationOptions?.precision || 4,
        format: options.geolocationOptions?.format || 'decimal',
        includeMapData: options.geolocationOptions?.includeMapData || false,
        combineGeolocation: options.geolocationOptions?.combineGeolocation || false,
      },
    };
  }

  static createPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      settings: any;
      templates: any;
      translations: any;
    }
  ): EntityAdapterProcessor {
    const processingContext = this.createProcessingContext(options, context);
    const processor = new EntityAdapterProcessor(processingContext);

    // Register processors by type
    processor.registerProcessor(new AdapterDateProcessor());
    processor.registerProcessor(new AdapterSelectProcessor());
    // Add more processors as needed

    return processor;
  }

  static createCardViewPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      settings: any;
      templates: any;
      translations: any;
    }
  ): EntityAdapterProcessor {
    const cardOptions: CompositionOptions = {
      ...options,
      onlyForCards: true,
      includeTemplate: true,
      includeMetadata: true,
      includePropertyMetadata: false, // Skip heavy metadata for cards
    };

    const processingContext = this.createProcessingContext(cardOptions, context);
    const processor = new EntityAdapterProcessor(processingContext);

    // Register only lightweight processors for cards
    processor.registerProcessor(new AdapterDateProcessor());
    processor.registerProcessor(new AdapterSelectProcessor());
    // Skip heavy processors for cards

    return processor;
  }
}
