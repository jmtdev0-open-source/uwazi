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
  readonly priority: number;
  readonly propertyTypes: string[];

  processBatch(
    properties: any[],
    context: ProcessingContext
  ): Promise<Map<string, FormattedProperty>>;
}
