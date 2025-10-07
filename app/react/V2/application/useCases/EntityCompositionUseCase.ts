/**
 * Entity Composition Use Case
 * Unified use case for entity composition with legacy pattern integration
 */
import { IncomingHttpHeaders } from 'http';
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import { MetadataFormatter } from '../services/MetadataFormatter';
import { atomStore, templatesAtom } from 'V2/atoms';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  CompositionError,
} from '../../domain/entities/types';
import { Entity, EntityFactory } from 'app/V2/domain';
import { EntityFormatter } from '../services/EntityFormatter';
import { FluentCompositionBuilder } from '../FluentCompositionBuilder';

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
  constructor(
    private readonly entityRepository: EntityRepository,
    private readonly metadataFormatter: MetadataFormatter,
    private readonly entityFormatter: EntityFormatter
  ) {}

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

      const composedEntity = await this.entityFormatter.composeEntityWithFormatting(entity, options, context);

      return {
        entity: composedEntity,
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
    const results: Entity[] = [];
    const errors: CompositionError[] = [];

    try {
      const entities = await this.entityRepository.findByIds(entityIds, options);

      await Promise.all(
        entities.map(async entity => {
          try {
            const composedEntity = await this.entityFormatter.composeEntityWithFormatting(
              entity,
              options,
              context
            );
            results.push(composedEntity);
          } catch (error) {
            errors.push({
              entityId: entity._id,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            });
          }
        })
      );

      return {
        entities: results,
        errors,
        success: errors.length === 0,
        totalProcessed: entityIds.length,
        successCount: results.length,
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
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeMetadata: true,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        includePermissions: true,
        onlyForCards: true,
      },
      context
    );
  }

  async composeEntitiesForDetailView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
      },
      context
    );
  }

  // Fluent API methods
  fluentForEntity(entityId: string): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this, entityId);
  }

  fluentForEntities(entityIds: string[]): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this, entityIds);
  }
}
