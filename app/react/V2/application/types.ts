/**
 * Unified Entity Composition Types
 * Consolidated types for the entity composition system
 */

import { Entity } from 'app/V2/domain/entities/Entity';

export interface CompositionContext {
  readonly userId?: string;
  readonly userPermissions?: string[];
  readonly language: string;
  readonly includePermissions: boolean;
}

export interface CompositionOptions {
  includeTemplate?: boolean;
  includeProperties?: boolean;
  includeMetadata?: boolean;
  includeRelationships?: boolean;
  includeFiles?: boolean;
  includeNavigation?: boolean;
  includePermissions?: boolean;
  onlyForCards?: boolean;
  excludePreview?: boolean;
  batchSize?: number;
  maxConcurrency?: number;
  userId?: string;
  userPermissions?: string[];
  language?: string;
  dateFormat?: string; // Custom date format (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')
  includePropertyMetadata?: boolean; // Include property type, inheritance info, and other metadata
  // Field selection options
  fieldNames?: string[]; // Specific field names to process
  fieldTypes?: string[]; // Specific field types to process (e.g., ['select', 'date'])
  includeFields?: string[]; // Field names to include (overrides other options)
}

export interface CompositionResult {
  readonly entity: Entity | null;
  readonly success: boolean;
  readonly error?: string;
}

export interface BatchCompositionResult {
  readonly entities: Entity[];
  readonly errors: CompositionError[];
  readonly success: boolean;
  readonly totalProcessed: number;
  readonly successCount: number;
  readonly errorCount: number;
}

export interface CompositionError {
  readonly entityId: string;
  readonly error: string;
  readonly timestamp: Date;
}

// export interface EntityPermissions {
//   readonly canRead: boolean;
//   readonly canWrite: boolean;
//   readonly canDelete: boolean;
//   readonly canShare: boolean;
//   readonly userPermissions: string[];
//   readonly groupPermissions: string[];
//   readonly publicAccess: boolean;
// }

// export interface ComposedTemplate {
//   readonly id: string;
//   readonly name: string;
//   readonly color: string;
//   readonly properties: ComposedProperty[];
// }

// export interface ComposedProperty {
//   readonly id: string;
//   readonly name: string;
//   readonly label: string;
//   readonly type: string;
//   readonly value: any;
//   readonly formattedValue: any;
//   readonly displayValue: string;
//   readonly showInCard: boolean;
//   readonly noLabel: boolean;
//   readonly style?: string;
//   readonly inherit?: any;
//   readonly denormalizedProperty?: string;
//   readonly indexInTemplate?: number;
//   readonly fullWidth?: boolean;
//   readonly obsolete?: boolean;
//   readonly translateContext?: string;
//   readonly parent?: string;
//   readonly members?: any[];
//   readonly fileName?: string;
//   readonly timeLinks?: any;
//   readonly relatedEntity?: any;
//   readonly inheritedType?: string;
//   readonly originalValue?: any;
//   readonly icon?: string;
//   readonly timestamp?: number;
//   readonly sortedBy?: boolean;
// }

// export interface ComposedRelationshipData {
//   readonly hubs: ComposedRelationshipHub[];
//   readonly connections: ComposedRelationship[];
//   readonly summary: RelationshipSummary;
//   readonly navigation: {
//     readonly availableTabs: Record<string, ComposedTab>;
//     readonly defaultTab: string;
//     readonly hasPageView: boolean;
//     readonly hasRelationships: boolean;
//     readonly hasNewRelationships: boolean;
//   };
// }

// export interface ComposedRelationshipHub {
//   readonly hubId: string;
//   readonly order: number;
//   readonly leftRelationship: ComposedRelationship;
//   readonly rightRelationships: Record<string, ComposedRelationship[]>;
// }

// export interface ComposedRelationship {
//   readonly id: string;
//   readonly sourceEntityId: string;
//   readonly targetEntityId: string;
//   readonly templateId: string;
//   readonly hub?: string;
// }

// export interface RelationshipSummary {
//   readonly totalConnections: number;
//   readonly hubCount: number;
// }

// export interface ComposedFileData {
//   readonly documents: ComposedDocument[];
//   readonly attachments: ComposedAttachment[];
//   readonly processed: boolean;
// }

// export interface ComposedDocument {
//   readonly id: string;
//   readonly filename: string;
//   readonly url: string;
//   readonly type: string;
//   readonly size: number;
//   readonly processed: boolean;
// }

// export interface ComposedAttachment {
//   readonly id: string;
//   readonly filename: string;
//   readonly originalname: string;
//   readonly url: string;
//   readonly type: string;
//   readonly size: number;
//   readonly mimetype: string;
//   readonly fileLocalID?: string;
//   readonly timeLinks?: any;
// }

// export interface ComposedNavigationData {
//   readonly availableTabs: Record<string, ComposedTab>;
//   readonly defaultTab: string;
//   readonly hasPageView: boolean;
//   readonly hasRelationships: boolean;
//   readonly hasNewRelationships: boolean;
//   readonly panelOpen: boolean;
//   readonly copyFrom: boolean;
//   readonly copyFromProps: string[];
// }

// export interface ComposedTab {
//   readonly id: string;
//   readonly label: string;
//   readonly icon: string;
//   readonly enabled: boolean;
//   readonly visible: boolean;
//   readonly component: string;
// }

// ComposedEntity is now a domain class, not an interface
// The domain class provides business logic and validation

// export interface LegacyFormattedData {
//   readonly entity: any;
//   readonly metadata: ComposedProperty[];
//   readonly relationships: ComposedRelationshipHub[];
//   readonly files: ComposedDocument[];
//   readonly attachments: ComposedAttachment[];
//   readonly summary: RelationshipSummary;
//   readonly navigation: {
//     readonly availableTabs: ComposedTab[];
//     readonly defaultTab: string;
//     readonly hasPageView: boolean;
//     readonly hasRelationships: boolean;
//     readonly hasNewRelationships: boolean;
//   };
// }
