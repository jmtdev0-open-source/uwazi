import { IncomingHttpHeaders } from 'http';
import { atomStore } from 'app/V2/atoms';
import { settingsAtom } from 'app/V2/atoms/settingsAtom';
import { templatesAtom } from 'app/V2/atoms/templatesAtom';
import { translationsAtom } from 'app/V2/atoms/translationsAtoms';
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  CompositionError,
} from '../../domain/entities/types';
import { FluentCompositionBuilder } from '../FluentCompositionBuilder';
import { EntityAdapterFactory } from '../services/EntityAdapterFactory';

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
  constructor(private readonly entityRepository: EntityRepository) {}

  async composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<CompositionResult> {
    try {
      const entity = await this.entityRepository.findBySharedId(entityId, options, context.headers);
      if (!entity) {
        return {
          entity: null,
          success: false,
          error: 'Entity not found',
        };
      }

      // Use the new EntityAdapterProcessor approach
      const processor = EntityAdapterFactory.createPipeline(options, {
        language: entity.language || 'en',
        userId: context.userId,
        userPermissions: context.userPermissions,
        settings: atomStore.get(settingsAtom) || {},
        templates: atomStore.get(templatesAtom) || [],
        translations: atomStore.get(translationsAtom) || [],
      });

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
      const entities = await this.entityRepository.findByIds(entityIds, options);

      // Use the new EntityAdapterProcessor approach for batch processing
      const processor = EntityAdapterFactory.createPipeline(options, {
        language: entities[0]?.language || 'en',
        userId: context.userId,
        userPermissions: context.userPermissions,
        settings: atomStore.get(settingsAtom) || {},
        templates: atomStore.get(templatesAtom) || [],
        translations: atomStore.get(translationsAtom) || [],
      });

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
      const entities = await this.entityRepository.findByIds(entityIds, {});

      // Use the card view pipeline for optimized card rendering
      const processor = EntityAdapterFactory.createCardViewPipeline(
        {
          onlyForCards: true,
          includeTemplate: true,
          includeMetadata: true,
          includePropertyMetadata: false, // Skip heavy metadata for cards
        },
        {
          language: entities[0]?.language || 'en',
          userId: context.userId,
          userPermissions: context.userPermissions,
          settings: atomStore.get(settingsAtom) || {},
          templates: atomStore.get(templatesAtom) || [],
          translations: atomStore.get(translationsAtom) || [],
        }
      );

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
