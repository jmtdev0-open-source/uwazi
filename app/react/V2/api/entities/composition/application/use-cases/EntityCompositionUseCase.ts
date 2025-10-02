/**
 * Entity Composition Use Case
 * Unified use case for entity composition with legacy pattern integration
 */
import { Entity } from '../../domain/entities/Entity';
import { EntityRepository } from '../../domain/repositories/EntityRepository';
import { EntityCompositionService } from '../../domain/services/EntityCompositionService';
import { LegacyMetadataFormatter } from '../../domain/services/LegacyMetadataFormatter';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  ComposedEntity,
  CompositionError,
} from '../../types';

export interface EntityCompositionUseCase {
  composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<CompositionResult>;

  composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  composeEntitiesForListView(
    entityIds: string[],
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

  composeEntitiesForFormView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  composeEntitiesByTemplate(
    templateId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  getLegacyFormattedData(entityId: string): Promise<any>;
  getFormattedMetadata(entityId: string, propertyName: string): Promise<any>;
  getFormattedRelationships(entityId: string): Promise<any>;
  getFormattedFiles(entityId: string): Promise<any>;
  getFormattedNavigation(entityId: string): Promise<any>;
}

export class EntityCompositionUseCaseImpl implements EntityCompositionUseCase {
  constructor(
    private readonly entityRepository: EntityRepository,
    private readonly entityCompositionService: EntityCompositionService,
    private readonly legacyMetadataFormatter: LegacyMetadataFormatter
  ) {}

  async composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<CompositionResult> {
    const startTime = performance.now();

    try {
      const entity = await this.entityRepository.findById(entityId, options);
      if (!entity) {
        return {
          entity: null,
          performance: { compositionTime: 0, resolutionTime: 0, cacheHits: 0, cacheMisses: 0 },
          success: false,
          error: 'Entity not found',
        };
      }

      const composedEntity = await this.composeEntityWithLegacyFormatting(entity, options, context);
      const endTime = performance.now();

      return {
        entity: composedEntity,
        performance: {
          compositionTime: endTime - startTime,
          resolutionTime: 0,
          cacheHits: 0,
          cacheMisses: 1,
        },
        success: true,
      };
    } catch (error) {
      return {
        entity: null,
        performance: { compositionTime: 0, resolutionTime: 0, cacheHits: 0, cacheMisses: 0 },
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
    const startTime = performance.now();
    const results: ComposedEntity[] = [];
    const errors: CompositionError[] = [];

    try {
      const entities = await this.entityRepository.findByIds(entityIds, options);

      await Promise.all(
        entities.map(async entity => {
          try {
            const composedEntity = await this.composeEntityWithLegacyFormatting(
              entity,
              options,
              context
            );
            results.push(composedEntity);
          } catch (error) {
            errors.push({
              entityId: entity.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            });
          }
        })
      );

      const endTime = performance.now();

      return {
        entities: results,
        performance: {
          totalTime: endTime - startTime,
          compositionTime: endTime - startTime,
          resolutionTime: 0,
          cacheHits: 0,
          cacheMisses: entityIds.length,
          sharedResourceHits: 0,
        },
        errors,
        success: errors.length === 0,
        totalProcessed: entityIds.length,
        successCount: results.length,
        errorCount: errors.length,
      };
    } catch (error) {
      return {
        entities: [],
        performance: {
          totalTime: 0,
          compositionTime: 0,
          resolutionTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
          sharedResourceHits: 0,
        },
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

  async composeEntitiesForListView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: false,
        includeMetadata: false,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        includePermissions: true,
        onlyForCards: true,
      },
      context
    );
  }

  async composeEntitiesForCardView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
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
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
      },
      context
    );
  }

  async composeEntitiesForFormView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
        excludePreview: true,
      },
      context
    );
  }

  async composeEntitiesByTemplate(
    templateId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    const entities = await this.entityRepository.findByTemplate(templateId, options);
    const entityIds = entities.map(entity => entity.id);
    return this.composeEntities(entityIds, options, context);
  }

  async getLegacyFormattedData(entityId: string): Promise<any> {
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) return null;

    return this.composeEntityWithLegacyFormatting(
      entity,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
      },
      {}
    );
  }

  async getFormattedMetadata(entityId: string, propertyName: string): Promise<any> {
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) return null;

    const property = entity.metadata[propertyName];
    if (!property) return null;

    return this.legacyMetadataFormatter.formatProperty(property, entity.language);
  }

  async getFormattedRelationships(entityId: string): Promise<any> {
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) return null;

    return entity.relationships;
  }

  async getFormattedFiles(entityId: string): Promise<any> {
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) return null;

    return entity.files;
  }

  async getFormattedNavigation(entityId: string): Promise<any> {
    const entity = await this.entityRepository.findById(entityId);
    if (!entity) return null;

    return entity.navigation;
  }

  private async composeEntityWithLegacyFormatting(
    entity: Entity,
    _options: CompositionOptions,
    _context: { userId?: string; userPermissions?: string[] }
  ): Promise<ComposedEntity> {
    // Apply legacy formatting to metadata
    const formattedMetadata: Record<string, any> = {};
    Object.entries(entity.metadata).forEach(([key, property]) => {
      formattedMetadata[key] = this.legacyMetadataFormatter.formatProperty(
        property,
        entity.language
      );
    });

    // Create composed entity with legacy formatting
    const composedEntity: ComposedEntity = {
      id: entity.id,
      sharedId: entity.sharedId,
      title: entity.title,
      language: entity.language,
      template: entity.template,
      creationDate: entity.creationDate,
      editDate: entity.editDate,
      icon: entity.icon,
      permissions: entity.permissions,
      metadata: formattedMetadata,
      relationships: Array.isArray(entity.relationships)
        ? {
            hubs: [],
            connections: entity.relationships,
            summary: { totalConnections: entity.relationships.length, hubCount: 0 },
            navigation: {
              availableTabs: {},
              defaultTab: 'info',
              hasPageView: false,
              hasRelationships: entity.relationships.length > 0,
              hasNewRelationships: false,
            },
          }
        : entity.relationships || {
            hubs: [],
            connections: [],
            summary: { totalConnections: 0, hubCount: 0 },
            navigation: {
              availableTabs: {},
              defaultTab: 'info',
              hasPageView: false,
              hasRelationships: false,
              hasNewRelationships: false,
            },
          },
      files: entity.files || { documents: [], attachments: [], processed: false },
      navigation: entity.navigation || {
        availableTabs: {},
        defaultTab: 'info',
        hasPageView: false,
        hasRelationships: false,
        hasNewRelationships: false,
        panelOpen: false,
        copyFrom: false,
        copyFromProps: [],
      },
      rawData: entity.toJSON(),
      formattedData: {
        entity: entity.toJSON(),
        metadata: Object.values(formattedMetadata),
        relationships: Array.isArray(entity.relationships)
          ? entity.relationships
          : (entity.relationships as any)?.hubs || [],
        files: entity.files?.documents || [],
        attachments: entity.files?.attachments || [],
        summary: Array.isArray(entity.relationships)
          ? { totalConnections: entity.relationships.length, hubCount: 0 }
          : (entity.relationships as any)?.summary || { totalConnections: 0, hubCount: 0 },
        navigation: entity.navigation,
      },
    };

    return composedEntity;
  }
}
