import { ClientSettings, Template, ClientThesaurus } from 'app/apiResponseTypes';
import { ClientTranslationSchema } from 'app/istore';
import { CompositionOptions } from 'app/V2/domain';

export interface PropertyValue {
  value: any;
  label?: string;
  displayValue?: string;
  formattedValue?: any;
  localizedValue?: string;
  icon?: string;
  url?: string;
  error?: string;
  selected?: boolean;
  // Media-specific properties
  mimetype?: string;
  size?: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  thumbnail?: string;
  // Timeline-specific properties
  timeFormatted?: string;
  totalSeconds?: number;
  index?: number;
  // Geolocation-specific properties
  lat?: number;
  lon?: number;
  precision?: number;
  // Relationship-specific properties
  entityId?: string;
  entityTitle?: string;
  templateName?: string;
  templateId?: string;
  // File-specific properties
  filename?: string;
  originalname?: string;
  fileType?: string;
  [key: string]: any;
}

export interface PropertyMetadata {
  showInCard: boolean;
  propertyType: string;
  isInherited: boolean;
  isRequired: boolean;
  isMultiple: boolean;
  noLabel: boolean;
  fullWidth: boolean;
  obsolete: boolean;
  indexInTemplate?: number;
  parent?: string;
  translateContext?: string;
  fileName?: string;
  timeLinks?: any;
  relatedEntity?: any;
  inheritedType?: string;
  inheritedValue?: any;
  denormalizedProperty?: string;
  sortedBy?: boolean;
  timestamp?: number;
  style?: string;
  url?: string;
  icon?: string;
  // Type-specific metadata
  [key: string]: any;
}

export interface FormattedProperty {
  values: PropertyValue[];
  options?: PropertyValue[]; // All available options with selection state (edition mode for select fields)
  timelines?: PropertyValue[]; // Timeline entries for media properties
  coordinates?: PropertyValue[]; // Flattened coordinates for geolocation properties
  relationships?: PropertyValue[]; // Flattened relationships
  mediaFiles?: PropertyValue[]; // Flattened media files
  label: string;
  name: string;
  translatedLabel?: string;
  propertyMetadata: PropertyMetadata;
  // Additional property data
  type: string;
  originalValue?: any;
  // Media-specific metadata
  fileMetadata?: {
    totalSize: number;
    totalDuration: number;
    fileTypes: string[];
    timelineCount: number;
  };
  // Geolocation-specific metadata
  coordinateMetadata?: {
    totalCoordinates: number;
    bounds?: { north: number; south: number; east: number; west: number };
    precision: number;
  };
  [key: string]: any;
}

export interface ProcessingContext {
  readonly options: CompositionOptions;
  readonly language: string;
  readonly userId?: string;
  readonly userPermissions?: string[];
  readonly translations: ClientTranslationSchema[];
  readonly settings: ClientSettings;
  readonly templates: Template[];
  readonly thesauri: ClientThesaurus[];

  readonly dateFormat: string;
  readonly timezone?: string;
  readonly includeTime: boolean;
  readonly relativeTime: boolean;
  readonly locale: string;
  readonly showLabels: boolean;
  readonly showIcons: boolean;
  readonly showUrls: boolean;
  readonly includeOptions: boolean;
  readonly nestedLevel: number;
  readonly includeEntityData: boolean;
  readonly includeTemplates: boolean;
  readonly maxRelationships?: number;
  readonly includeFileMetadata: boolean;
  readonly includeThumbnails: boolean;
  readonly maxFileSize?: number;
  readonly allowedTypes?: string[];
  readonly precision: number;
  readonly includeMapData: boolean;
  readonly combineGeolocation: boolean;
}

export interface ProcessingError {
  readonly entityId: string;
  readonly error: string;
  readonly timestamp: Date;
}

export interface PropertyTypeProcessor {
  readonly name: string;
  readonly propertyTypes: string[];

  processBatch(
    properties: any[],
    context: ProcessingContext
  ): Promise<Map<string, FormattedProperty>>;
}
