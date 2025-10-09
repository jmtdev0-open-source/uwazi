import { ClientSettings, Template } from 'app/apiResponseTypes';
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
  [key: string]: any; // Allow additional properties
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
  label: string;
  name: string;
  translatedLabel?: string;
  propertyMetadata: PropertyMetadata;
  // Additional property data
  type: string;
  originalValue?: any;
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
  // Pre-calculated formatting utilities
  readonly dateFormatting: {
    format: string;
    timezone?: string;
    includeTime: boolean;
    relativeTime: boolean;
    locale: string;
  };
  readonly selectFormatting: {
    showLabels: boolean;
    showIcons: boolean;
    showUrls: boolean;
    includeOptions: boolean;
  };
  readonly relationshipFormatting: {
    nestedLevel: number;
    includeEntityData: boolean;
    includeTemplates: boolean;
    maxRelationships?: number;
  };
  readonly fileFormatting: {
    includeFileMetadata: boolean;
    includeThumbnails: boolean;
    maxFileSize?: number;
    allowedTypes?: string[];
  };
  readonly geolocationFormatting: {
    precision: number;
    format: string;
    includeMapData: boolean;
    combineGeolocation: boolean;
  };
}

export interface ProcessingError {
  readonly field: string;
  readonly error: string;
  readonly timestamp: Date;
}

export interface PropertyTypeProcessor {
  readonly name: string;
  readonly priority: number;
  readonly propertyTypes: string[];

  processBatch(
    properties: any[],
    context: ProcessingContext
  ): Promise<Map<string, FormattedProperty>>;
}
