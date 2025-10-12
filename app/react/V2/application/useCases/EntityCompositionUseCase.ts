import { IncomingHttpHeaders } from 'http';
import { atomStore } from 'app/V2/atoms';
import { settingsAtom } from 'app/V2/atoms/settingsAtom';
import { templatesAtom } from 'app/V2/atoms/templatesAtom';
import { translationsAtom } from 'app/V2/atoms/translationsAtoms';
import { thesauriAtom } from 'app/V2/atoms/thesauriAtom';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  CompositionError,
} from '../../domain/entities/types';
import { FluentCompositionBuilder } from '../FluentCompositionBuilder';
import { EntityAdapterProcessor } from '../services/processors/EntityAdapterProcessor';
import { ProcessingContext } from '../services/processors/types';
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';

export interface EntityCompositionUseCase {
  composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<CompositionResult>;

  composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  composeEntitiesForCardView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  composeEntitiesForDetailView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  // Fluent API methods
  fluentForEntity(entityId: string): FluentCompositionBuilder;
  fluentForEntities(entityIds: string[]): FluentCompositionBuilder;
}

export class EntityCompositionUseCaseImpl implements EntityCompositionUseCase {
  constructor(private readonly repository: EntityRepository) {}

  private createProcessingContext(
    options: CompositionOptions,
    context: {
      language: string;
      userId?: string;
      userPermissions?: string[];
      settings: any;
      templates: any;
      translations: any;
      thesauri: any;
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
      thesauri: context.thesauri || [],

      dateFormat:
        options.dateOptions?.dateFormat ||
        options.dateFormat ||
        context.settings?.dateFormat ||
        'YYYY-MM-DD',
      timezone: options.dateOptions?.timezone,
      includeTime: options.dateOptions?.includeTime || false,
      relativeTime: options.dateOptions?.relativeTime || false,
      locale: options.dateOptions?.locale || context.language,
      showLabels: options.selectOptions?.showLabels !== false,
      showIcons: options.selectOptions?.showIcons || false,
      showUrls: options.selectOptions?.showUrls || false,
      includeOptions: options.selectOptions?.includeOptions || false,
      nestedLevel: options.relationshipOptions?.nestedLevel || 1,
      includeEntityData: options.relationshipOptions?.includeEntityData || false,
      includeTemplates: options.relationshipOptions?.includeTemplates || false,
      maxRelationships: options.relationshipOptions?.maxRelationships,
      includeFileMetadata: options.fileOptions?.includeFileMetadata || false,
      includeThumbnails: options.fileOptions?.includeThumbnails || false,
      maxFileSize: options.fileOptions?.maxFileSize,
      allowedTypes: options.fileOptions?.allowedTypes,
      precision: options.geolocationOptions?.precision || 6,
      includeMapData: options.geolocationOptions?.includeMapData || false,
      combineGeolocation: options.geolocationOptions?.combineGeolocation || false,
    };
  }

  async composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<CompositionResult> {
    try {
      const response = await this.repository.getBySharedId(
        {
          sharedId: entityId,
          language: 'en',
          omitRelationships: true,
        },
        context.headers
      );

      if (!response || response.length === 0) {
        return {
          entity: null,
          success: false,
          error: 'Entity not found',
        };
      }

      const entity = response[0];

      const processingContext = this.createProcessingContext(options, {
        language: entity.language || 'en',
        userId: context.userId,
        userPermissions: context.userPermissions,
        settings: atomStore.get(settingsAtom) || {},
        templates: atomStore.get(templatesAtom) || [],
        translations: atomStore.get(translationsAtom) || [],
        thesauri: atomStore.get(thesauriAtom) || [],
      });
      const processor = new EntityAdapterProcessor(processingContext);

      const result = await processor.processEntity(entity);

      return {
        entity: result.entity,
        success: true,
      };
    } catch (error) {
      return {
        entity: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    try {
      const entities = await this.repository.getBySharedIds({
        sharedIds: entityIds,
        language: 'en',
        omitRelationships: true,
      });

      const processingContext = this.createProcessingContext(options, {
        language: entities[0]?.language || 'en',
        userId: context.userId,
        userPermissions: context.userPermissions,
        settings: atomStore.get(settingsAtom) || {},
        templates: atomStore.get(templatesAtom) || [],
        translations: atomStore.get(translationsAtom) || [],
        thesauri: atomStore.get(thesauriAtom) || [],
      });
      const processor = new EntityAdapterProcessor(processingContext);

      const result = await processor.processAllEntities(entities);

      // Convert processing errors to composition errors
      const errors: CompositionError[] = result.errors.map(error => ({
        entityId: 'batch',
        error: error.error,
        timestamp: error.timestamp,
      }));

      return {
        entities: result.entities,
        errors,
        success: errors.length === 0,
        totalProcessed: entityIds.length,
        successCount: result.entities.length,
        errorCount: errors.length,
      };
    } catch (error) {
      return {
        entities: [],
        errors: [
          {
            entityId: 'batch',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        ],
        success: false,
        totalProcessed: entityIds.length,
        successCount: 0,
        errorCount: entityIds.length,
      };
    }
  }

  async composeEntitiesForCardView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    try {
      const entities = await this.repository.getBySharedIds({
        sharedIds: entityIds,
        language: 'en',
        omitRelationships: true,
      });

      const cardOptions = {
        onlyForCards: true,
        includeTemplate: true,
        includeMetadata: true,
        includePropertyMetadata: false, // Skip heavy metadata for cards
      };
      const processingContext = this.createProcessingContext(cardOptions, {
        language: entities[0]?.language || 'en',
        userId: context.userId,
        userPermissions: context.userPermissions,
        settings: atomStore.get(settingsAtom) || {},
        templates: atomStore.get(templatesAtom) || [],
        translations: atomStore.get(translationsAtom) || [],
        thesauri: atomStore.get(thesauriAtom) || [],
      });
      const processor = new EntityAdapterProcessor(processingContext);

      const result = await processor.processAllEntities(entities);

      const errors: CompositionError[] = result.errors.map(error => ({
        entityId: 'batch',
        error: error.error,
        timestamp: error.timestamp,
      }));

      return {
        entities: result.entities,
        errors,
        success: errors.length === 0,
        totalProcessed: entityIds.length,
        successCount: result.entities.length,
        errorCount: errors.length,
      };
    } catch (error) {
      return {
        entities: [],
        errors: [
          {
            entityId: 'batch',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        ],
        success: false,
        totalProcessed: entityIds.length,
        successCount: 0,
        errorCount: entityIds.length,
      };
    }
  }

  async composeEntitiesForDetailView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    const detailOptions: CompositionOptions = {
      includeTemplate: true,
      includeMetadata: true,
      includePropertyMetadata: true,
      includeRelationships: true,
      includeFiles: true,
      includeNavigation: true,
    };

    return this.composeEntities(entityIds, detailOptions, context);
  }

  async composeEntitiesForFormView(
    entityIds: string[],
    _context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    const builder = this.fluentForEntities(entityIds).forForm();
    return builder.compose() as Promise<BatchCompositionResult>;
  }

  // Fluent API methods
  fluentForEntity(entityId: string): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this, entityId);
  }

  fluentForEntities(entityIds: string[]): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this, entityIds);
  }
}
