/**
 * Fluent Composition Builder
 * Provides a fluent API for entity composition
 */
import { EntityCompositionUseCase } from '../application/use-cases/EntityCompositionUseCase';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  ComposedEntity,
} from '../types';

export class FluentCompositionBuilder {
  private options: CompositionOptions = {};
  private context: { userId?: string; userPermissions?: string[] } = {};

  constructor(
    private readonly useCase: EntityCompositionUseCase,
    private readonly entityIdOrIds: string | string[]
  ) {}

  /**
   * Include template data
   */
  withTemplate(): FluentCompositionBuilder {
    this.options.includeTemplate = true;
    return this;
  }

  /**
   * Include properties data
   */
  withProperties(): FluentCompositionBuilder {
    this.options.includeProperties = true;
    return this;
  }

  /**
   * Include metadata
   */
  withMetadata(): FluentCompositionBuilder {
    this.options.includeMetadata = true;
    return this;
  }

  /**
   * Include relationships
   */
  withRelationships(): FluentCompositionBuilder {
    this.options.includeRelationships = true;
    return this;
  }

  /**
   * Include files
   */
  withFiles(): FluentCompositionBuilder {
    this.options.includeFiles = true;
    return this;
  }

  /**
   * Include navigation
   */
  withNavigation(): FluentCompositionBuilder {
    this.options.includeNavigation = true;
    return this;
  }

  /**
   * Include permissions
   */
  withPermissions(): FluentCompositionBuilder {
    this.options.includePermissions = true;
    return this;
  }

  /**
   * Set user context
   */
  forUser(userId: string, userPermissions: string[] = []): FluentCompositionBuilder {
    this.context.userId = userId;
    this.context.userPermissions = userPermissions;
    return this;
  }

  /**
   * Set language
   */
  inLanguage(language: string): FluentCompositionBuilder {
    this.options.language = language;
    return this;
  }

  /**
   * Optimize for list view
   */
  forListView(): FluentCompositionBuilder {
    this.options.includeTemplate = true;
    this.options.includeProperties = false;
    this.options.includeMetadata = false;
    this.options.includeRelationships = false;
    this.options.includeFiles = false;
    this.options.includeNavigation = false;
    this.options.includePermissions = true;
    this.options.onlyForCards = true;
    return this;
  }

  /**
   * Optimize for card view
   */
  forCardView(): FluentCompositionBuilder {
    this.options.includeTemplate = true;
    this.options.includeProperties = true;
    this.options.includeMetadata = true;
    this.options.includeRelationships = false;
    this.options.includeFiles = false;
    this.options.includeNavigation = false;
    this.options.includePermissions = true;
    this.options.onlyForCards = true;
    return this;
  }

  /**
   * Optimize for detail view
   */
  forDetailView(): FluentCompositionBuilder {
    this.options.includeTemplate = true;
    this.options.includeProperties = true;
    this.options.includeMetadata = true;
    this.options.includeRelationships = true;
    this.options.includeFiles = true;
    this.options.includeNavigation = true;
    this.options.includePermissions = true;
    return this;
  }

  /**
   * Optimize for form view
   */
  forFormView(): FluentCompositionBuilder {
    this.options.includeTemplate = true;
    this.options.includeProperties = true;
    this.options.includeMetadata = true;
    this.options.includeRelationships = true;
    this.options.includeFiles = true;
    this.options.includeNavigation = true;
    this.options.includePermissions = true;
    this.options.excludePreview = true;
    return this;
  }

  /**
   * Set batch size
   */
  withBatchSize(batchSize: number): FluentCompositionBuilder {
    this.options.batchSize = batchSize;
    return this;
  }

  /**
   * Set max concurrency
   */
  withMaxConcurrency(maxConcurrency: number): FluentCompositionBuilder {
    this.options.maxConcurrency = maxConcurrency;
    return this;
  }

  /**
   * Enable new relationships
   */
  withNewRelationships(): FluentCompositionBuilder {
    this.options.newRelationshipsEnabled = true;
    return this;
  }

  /**
   * Exclude preview data
   */
  excludePreview(): FluentCompositionBuilder {
    this.options.excludePreview = true;
    return this;
  }

  /**
   * Select specific fields by name
   */
  withFields(fieldNames: string[]): FluentCompositionBuilder {
    this.options.fieldNames = fieldNames;
    return this;
  }

  /**
   * Select fields by pattern matching
   */
  withFieldPatterns(patterns: string[]): FluentCompositionBuilder {
    this.options.fieldPatterns = patterns;
    return this;
  }

  /**
   * Select fields by type
   */
  withFieldTypes(types: string[]): FluentCompositionBuilder {
    this.options.fieldTypes = types;
    return this;
  }

  /**
   * Exclude specific fields
   */
  excludeFields(fieldNames: string[]): FluentCompositionBuilder {
    this.options.excludeFields = fieldNames;
    return this;
  }

  /**
   * Include only specific fields (overrides other selections)
   */
  includeOnlyFields(fieldNames: string[]): FluentCompositionBuilder {
    this.options.includeFields = fieldNames;
    return this;
  }

  /**
   * Execute the composition
   */
  async compose(): Promise<CompositionResult | BatchCompositionResult> {
    if (Array.isArray(this.entityIdOrIds)) {
      return this.useCase.composeEntities(this.entityIdOrIds, this.options, this.context);
    }
    return this.useCase.composeEntity(this.entityIdOrIds, this.options, this.context);
  }

  /**
   * Execute and return only the entity/entities
   */
  async getEntity(): Promise<ComposedEntity | null> {
    const result = await this.compose();
    if ('entity' in result) {
      return result.entity;
    }
    return null;
  }

  /**
   * Execute and return only the entities
   */
  async getEntities(): Promise<ComposedEntity[]> {
    const result = await this.compose();
    if ('entities' in result) {
      return result.entities;
    }
    return [];
  }

  /**
   * Execute and return the result with performance metrics
   */
  async getResultWithPerformance(): Promise<{
    result: CompositionResult | BatchCompositionResult;
    performance: any;
  }> {
    const result = await this.compose();
    const performance = 'performance' in result ? result.performance : null;
    return { result, performance };
  }
}
