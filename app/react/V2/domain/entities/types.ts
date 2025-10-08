/**
 * Unified Entity Composition Types
 * Consolidated types for the entity composition system
 */

import { Entity } from './Entity';

export interface CompositionContext {
  readonly userId?: string;
  readonly userPermissions?: string[];
  readonly language: string;
  readonly includePermissions: boolean;
}

// Type-specific options for different property types
export interface DateCompositionOptions {
  dateFormat?: string; // Custom date format (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')
  timezone?: string; // Timezone for date formatting
  includeTime?: boolean; // Include time in date formatting
  relativeTime?: boolean; // Show relative time (e.g., "2 days ago")
  locale?: string; // Locale for date formatting
}

export interface SelectCompositionOptions {
  includeOptions?: boolean; // Include all available options
  showLabels?: boolean; // Show option labels
  showIcons?: boolean; // Show option icons
  showUrls?: boolean; // Show option URLs
  translateLabels?: boolean; // Translate option labels
}

export interface RelationshipCompositionOptions {
  nestedLevel?: number; // How deep to nest relationships
  includeEntityData?: boolean; // Include full entity data
  includeTemplates?: boolean; // Include template information
  maxRelationships?: number; // Maximum number of relationships to include
}

export interface GeolocationCompositionOptions {
  combineGeolocation?: boolean; // Combine multiple geolocation points
  includeMapData?: boolean; // Include map visualization data
  precision?: number; // Decimal precision for coordinates
  format?: 'decimal' | 'dms'; // Coordinate format (decimal degrees or degrees/minutes/seconds)
}

export interface FileCompositionOptions {
  includeFileMetadata?: boolean; // Include file size, type, etc.
  includeThumbnails?: boolean; // Include thumbnail URLs
  maxFileSize?: number; // Maximum file size to include
  allowedTypes?: string[]; // Allowed file types
}

export interface MarkdownCompositionOptions {
  stripHtml?: boolean; // Strip HTML tags
  maxLength?: number; // Maximum text length
  includeHtml?: boolean; // Include HTML version
  includeText?: boolean; // Include plain text version
}

export interface NestedCompositionOptions {
  maxDepth?: number; // Maximum nesting depth
  includeChildren?: boolean; // Include child properties
  flatten?: boolean; // Flatten nested structure
}

export interface InheritCompositionOptions {
  showInheritance?: boolean; // Show inheritance information
  includeOriginalValue?: boolean; // Include original value before inheritance
  showInheritedFrom?: boolean; // Show what property was inherited from
}

export interface CompositionOptions {
  includeTemplate?: boolean;
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
  includeFields?: string[]; // Field names to include (overrides other options)
  editionMode?: boolean; // Edition mode
  combineGeolocation?: boolean; // Combine geolocation points
  relationshipNestedLevel?: number; // Relationship nested level
  formatTimeLinks?: boolean; // Format time links
  translateLabels?: boolean; // Translate labels
  includeRawMetadata?: boolean; // Include raw values
  
  // Type-specific options (nested for flexibility)
  dateOptions?: DateCompositionOptions;
  selectOptions?: SelectCompositionOptions;
  relationshipOptions?: RelationshipCompositionOptions;
  geolocationOptions?: GeolocationCompositionOptions;
  fileOptions?: FileCompositionOptions;
  markdownOptions?: MarkdownCompositionOptions;
  nestedOptions?: NestedCompositionOptions;
  inheritOptions?: InheritCompositionOptions;
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

export interface EntityPermissions {
  readonly canRead: boolean;
  readonly canWrite: boolean;
  readonly canDelete: boolean;
  readonly canShare: boolean;
  readonly userPermissions: string[];
  readonly groupPermissions: string[];
  readonly publicAccess: boolean;
}

export interface ComposedTemplate {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly properties: ComposedProperty[];
}

export interface ComposedProperty {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly type: string;
  readonly value: any;
  readonly formattedValue: any;
  readonly displayValue: string;
  readonly showInCard: boolean;
  readonly noLabel: boolean;
  readonly style?: string;
  readonly inherit?: any;
  readonly denormalizedProperty?: string;
  readonly indexInTemplate?: number;
  readonly fullWidth?: boolean;
  readonly obsolete?: boolean;
  readonly translateContext?: string;
  readonly parent?: string;
  readonly members?: any[];
  readonly fileName?: string;
  readonly timeLinks?: any;
  readonly relatedEntity?: any;
  readonly inheritedType?: string;
  readonly originalValue?: any;
  readonly icon?: string;
  readonly timestamp?: number;
  readonly sortedBy?: boolean;
}

export interface ComposedRelationshipData {
  readonly hubs: ComposedRelationshipHub[];
  readonly connections: ComposedRelationship[];
  readonly summary: RelationshipSummary;
  readonly navigation: {
    readonly hasPageView: boolean;
    readonly hasRelationships: boolean;
  };
}

export interface ComposedRelationshipHub {
  readonly hubId: string;
  readonly order: number;
  readonly leftRelationship: ComposedRelationship;
  readonly rightRelationships: Record<string, ComposedRelationship[]>;
}

export interface ComposedRelationship {
  readonly id: string;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly templateId: string;
  readonly hub?: string;
}

export interface RelationshipSummary {
  readonly totalConnections: number;
  readonly hubCount: number;
}

export interface ComposedFileData {
  readonly documents: ComposedDocument[];
  readonly attachments: ComposedAttachment[];
  readonly processed: boolean;
}

export interface ComposedDocument {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly type: string;
  readonly size: number;
  readonly processed: boolean;
}

export interface ComposedAttachment {
  readonly id: string;
  readonly filename: string;
  readonly originalname: string;
  readonly url: string;
  readonly type: string;
  readonly size: number;
  readonly mimetype: string;
  readonly fileLocalID?: string;
  readonly timeLinks?: any;
}

export interface ComposedNavigationData {
  readonly hasPageView: boolean;
  readonly hasRelationships: boolean;
  readonly hasNewRelationships: boolean;
  readonly panelOpen: boolean;
  readonly copyFrom: boolean;
  readonly copyFromProps: string[];
}
