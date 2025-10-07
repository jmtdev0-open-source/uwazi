/**
 * Fluent Composition Builder
 * Provides a fluent API for entity composition
 */
import { Entity } from 'app/V2/domain/entities/Entity';
import { EntityCompositionUseCase } from './useCases/EntityCompositionUseCase';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
} from '../domain/entities/types';

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
   * Set language
   */
  inLanguage(language: string): FluentCompositionBuilder {
    this.options.language = language;
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
   * Select specific fields by name
   */
  withFields(fieldNames: string[]): FluentCompositionBuilder {
    this.options.fieldNames = fieldNames;
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
  async getEntity(): Promise<Entity | null> {
    const result = await this.compose();
    if ('entity' in result) {
      return result.entity;
    }
    return null;
  }

  /**
   * Execute and return only the entities
   */
  async getEntities(): Promise<Entity[]> {
    const result = await this.compose();
    if ('entities' in result) {
      return result.entities;
    }
    return [];
  }
}
