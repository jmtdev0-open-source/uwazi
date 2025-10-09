import { CompositionOptions } from 'app/V2/domain';
import { EntityAdapterProcessor } from './processors/EntityAdapterProcessor';
import { AdapterDateProcessor } from './processors/AdapterDateProcessor';
import { AdapterSelectProcessor } from './processors/AdapterSelectProcessor';
import { AdapterProcessingContext } from './processors/types';

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
  ): AdapterProcessingContext {
    return {
      options,
      language: context.language,
      userId: context.userId,
      userPermissions: context.userPermissions,
      translations: context.translations,
      settings: context.settings,
      templates: context.templates,
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
