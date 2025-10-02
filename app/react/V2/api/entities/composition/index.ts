/**
 * Unified Entity Composition Solution
 * Main entry point for the entity composition system
 */

// Core exports
export { EntityComposer } from './core/EntityComposer';
export { FluentCompositionBuilder } from './core/FluentCompositionBuilder';

// Domain exports
export { Entity } from './domain/entities/Entity';
export type { EntityRepository } from './domain/repositories/EntityRepository';
export type { EntityCompositionService } from './domain/services/EntityCompositionService';
export type { LegacyMetadataFormatter } from './domain/services/LegacyMetadataFormatter';
export { LegacyMetadataFormatterImpl } from './domain/services/LegacyMetadataFormatter';

// Application exports
export type { EntityCompositionUseCase } from './application/use-cases/EntityCompositionUseCase';
export { EntityCompositionUseCaseImpl } from './application/use-cases/EntityCompositionUseCase';
export { DependencyContainer } from './application/container/DependencyContainer';

// Infrastructure exports
export { EntityRepositoryImpl } from './infrastructure/repositories/EntityRepositoryImpl';

// Presentation exports
export {
  EntityCompositionProvider,
  useEntityComposition,
  useFluentEntityComposition,
  useEntityCompositionWithPerformance,
  useEntityCompositionWithCaching,
  useLegacyEntityComposition,
} from './presentation/hooks/useEntityComposition';

export { default as UnifiedEntityCompositionExample } from './presentation/examples/UnifiedEntityCompositionExample';

// Type exports
export type {
  CompositionContext,
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  PerformanceMetrics,
  BatchPerformanceMetrics,
  CompositionError,
  EntityPermissions,
  ComposedTemplate,
  ComposedProperty,
  ComposedRelationshipData,
  ComposedRelationshipHub,
  ComposedRelationship,
  RelationshipSummary,
  ComposedFileData,
  ComposedDocument,
  ComposedAttachment,
  ComposedNavigationData,
  ComposedTab,
  ComposedEntity,
  LegacyFormattedData,
  ValidationResult,
} from './types';
