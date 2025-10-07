/**
 * Entity Composer
 * Main orchestrator for the unified entity composition solution
 */
import { EntityCompositionUseCase } from './useCases/EntityCompositionUseCase';
import { FluentCompositionBuilder } from './FluentCompositionBuilder';
import {
  BatchCompositionResult,
  CompositionOptions,
  CompositionResult,
} from '../domain/entities/types';

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
  // async composeEntitiesForListView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult> {
  //   return this.useCase.composeEntitiesForListView(entityIds, context);
  // }

  /**
   * Compose entities for card view (display data)
   */
  // async composeEntitiesForCardView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult> {
  //   return this.useCase.composeEntitiesForCardView(entityIds, context);
  // }

  /**
   * Compose entities for detail view (full data)
   */
  // async composeEntitiesForDetailView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult> {
  //   return this.useCase.composeEntitiesForDetailView(entityIds, context);
  // }

  /**
   * Compose entities for form view (editable data)
   */
  // async composeEntitiesForFormView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult> {
  //   return this.useCase.composeEntitiesForFormView(entityIds, context);
  // }

  /**
   * Compose entities by template
   */
  // async composeEntitiesByTemplate(
  //   templateId: string,
  //   options: CompositionOptions,
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult> {
  //   return this.useCase.composeEntitiesByTemplate(templateId, options, context);
  // }
}
