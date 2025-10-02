/**
 * Entity Composer
 * Main orchestrator for the unified entity composition solution
 */
import { EntityCompositionUseCase } from '../application/use-cases/EntityCompositionUseCase';
import { FluentCompositionBuilder } from './FluentCompositionBuilder';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  PerformanceMetrics,
} from '../types';

export class EntityComposer {
  constructor(private readonly useCase: EntityCompositionUseCase) {}

  /**
   * Create a fluent builder for single entity composition
   */
  fluentForEntity(entityId: string): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this.useCase, entityId);
  }

  /**
   * Create a fluent builder for multiple entities composition
   */
  fluentForEntities(entityIds: string[]): FluentCompositionBuilder {
    return new FluentCompositionBuilder(this.useCase, entityIds);
  }

  /**
   * Compose a single entity with options
   */
  async composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<CompositionResult> {
    return this.useCase.composeEntity(entityId, options, context);
  }

  /**
   * Compose multiple entities with options
   */
  async composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntities(entityIds, options, context);
  }

  /**
   * Compose entities for list view (minimal data)
   */
  async composeEntitiesForListView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntitiesForListView(entityIds, context);
  }

  /**
   * Compose entities for card view (display data)
   */
  async composeEntitiesForCardView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntitiesForCardView(entityIds, context);
  }

  /**
   * Compose entities for detail view (full data)
   */
  async composeEntitiesForDetailView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntitiesForDetailView(entityIds, context);
  }

  /**
   * Compose entities for form view (editable data)
   */
  async composeEntitiesForFormView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntitiesForFormView(entityIds, context);
  }

  /**
   * Compose entities by template
   */
  async composeEntitiesByTemplate(
    templateId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.useCase.composeEntitiesByTemplate(templateId, options, context);
  }

  /**
   * Get legacy formatted data
   */
  async getLegacyFormattedData(entityId: string): Promise<any> {
    return this.useCase.getLegacyFormattedData(entityId);
  }

  /**
   * Get formatted metadata for a specific property
   */
  async getFormattedMetadata(entityId: string, propertyName: string): Promise<any> {
    return this.useCase.getFormattedMetadata(entityId, propertyName);
  }

  /**
   * Get formatted relationships
   */
  async getFormattedRelationships(entityId: string): Promise<any> {
    return this.useCase.getFormattedRelationships(entityId);
  }

  /**
   * Get formatted files
   */
  async getFormattedFiles(entityId: string): Promise<any> {
    return this.useCase.getFormattedFiles(entityId);
  }

  /**
   * Get formatted navigation
   */
  async getFormattedNavigation(entityId: string): Promise<any> {
    return this.useCase.getFormattedNavigation(entityId);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceMetrics {
    // This would be implemented with actual performance tracking
    return {
      compositionTime: 0,
      resolutionTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
    totalRequests: number;
  } {
    // This would be implemented with actual cache tracking
    return {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      totalRequests: 0,
    };
  }
}
