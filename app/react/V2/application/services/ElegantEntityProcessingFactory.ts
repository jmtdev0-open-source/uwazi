/**
 * Elegant Entity Processing Factory
 * Combines shared data preparation + lodash filtering + register pattern
 */
import { CompositionOptions } from 'app/V2/domain';
import { ElegantBatchProcessor } from './processors/ElegantBatchProcessor';
import { ElegantDateProcessor } from './processors/ElegantDateProcessor';
import { ElegantSelectProcessor } from './processors/ElegantSelectProcessor';
import { BatchProcessingContext } from './processors/PropertyStructure';

export class ElegantEntityProcessingFactory {
  /**
   * Create a processing context with all necessary data
   */
  private static createProcessingContext(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      atomStore: any;
    }
  ): BatchProcessingContext {
    // Get additional data from atom store
    const translations = context.atomStore.get('translationsAtom') || {};
    const settings = context.atomStore.get('settingsAtom') || {};
    const templates = context.atomStore.get('templatesAtom') || [];

    return {
      options,
      language: context.language,
      userId: context.userId,
      userPermissions: context.userPermissions,
      atomStore: context.atomStore,
      translations,
      settings,
      templates,
      processedProperties: new Map(), // Cache for batch processing
    };
  }

  /**
   * Create an elegant processing pipeline
   */
  static createPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      atomStore: any;
    }
  ): ElegantBatchProcessor {
    const processingContext = this.createProcessingContext(options, context);
    const processor = new ElegantBatchProcessor(processingContext);

    // Register processors by type
    processor.registerProcessor(new ElegantDateProcessor());
    processor.registerProcessor(new ElegantSelectProcessor());
    // Add more processors as needed

    return processor;
  }

  /**
   * Create a pipeline optimized for card view
   */
  static createCardViewPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      atomStore: any;
    }
  ): ElegantBatchProcessor {
    const cardOptions: CompositionOptions = {
      ...options,
      onlyForCards: true,
      includeTemplate: true,
      includeMetadata: true,
      includePropertyMetadata: false, // Skip heavy metadata for cards
    };

    const processingContext = this.createProcessingContext(cardOptions, context);
    const processor = new ElegantBatchProcessor(processingContext);

    // Register only lightweight processors for cards
    processor.registerProcessor(new ElegantDateProcessor());
    processor.registerProcessor(new ElegantSelectProcessor());
    // Skip heavy processors for cards

    return processor;
  }

  /**
   * Create a pipeline optimized for full entity view
   */
  static createFullViewPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      atomStore: any;
    }
  ): ElegantBatchProcessor {
    const fullOptions: CompositionOptions = {
      ...options,
      includeTemplate: true,
      includeMetadata: true,
      includeRelationships: true,
      includeFiles: true,
      includeNavigation: true,
      includePropertyMetadata: true,
    };

    const processingContext = this.createProcessingContext(fullOptions, context);
    const processor = new ElegantBatchProcessor(processingContext);

    // Register all processors for full view
    processor.registerProcessor(new ElegantDateProcessor());
    processor.registerProcessor(new ElegantSelectProcessor());
    // Add more processors as needed

    return processor;
  }

  /**
   * Create a pipeline with custom processor configuration
   */
  static createCustomPipeline(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      atomStore: any;
    },
    customConfig: {
      includeProcessors?: string[];
      excludeProcessors?: string[];
      processorPriorities?: Record<string, number>;
    }
  ): ElegantBatchProcessor {
    const processingContext = this.createProcessingContext(options, context);
    const processor = new ElegantBatchProcessor(processingContext);
    
    // Register processors based on custom configuration
    const availableProcessors = {
      date: new ElegantDateProcessor(),
      select: new ElegantSelectProcessor(),
      // Add more processors as needed
    };

    // Register included processors or all if none specified
    const processorsToRegister = customConfig.includeProcessors || Object.keys(availableProcessors);
    const excludedProcessors = customConfig.excludeProcessors || [];

    processorsToRegister.forEach(processorName => {
      if (!excludedProcessors.includes(processorName) && availableProcessors[processorName as keyof typeof availableProcessors]) {
        processor.registerProcessor(availableProcessors[processorName as keyof typeof availableProcessors]);
      }
    });
    
    return processor;
  }
}

