/**
 * Shared Property Factory
 * Creates formatted properties efficiently by reusing common structure
 */
import { 
  FormattedProperty, 
  PropertyValue, 
  BatchProcessingContext 
} from './PropertyStructure';

export class SharedPropertyFactory {
  private readonly context: BatchProcessingContext;
  private readonly sharedMetadata: Map<string, any> = new Map();
  private readonly sharedTranslations: Map<string, string> = new Map();
  private readonly preCalculatedMetadata: Map<string, any> = new Map();

  constructor(context: BatchProcessingContext) {
    this.context = context;
    this.prepareSharedData();
  }

  /**
   * Prepare ALL shared data once
   * This includes common metadata patterns, translations, etc.
   */
  private prepareSharedData(): void {
    // Prepare common metadata patterns
    this.prepareCommonMetadataPatterns();
    
    // Prepare translations cache
    this.prepareTranslationsCache();
    
    // Pre-calculate ALL property metadata that will be reused
    this.preCalculateAllPropertyMetadata();
  }

  /**
   * Prepare common metadata patterns that can be reused
   */
  private prepareCommonMetadataPatterns(): void {
    const { options } = this.context;
    
    // Common metadata patterns by property type
    this.sharedMetadata.set('date', {
      showInCard: false,
      propertyType: 'date',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
    });

    this.sharedMetadata.set('select', {
      showInCard: false,
      propertyType: 'select',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
    });

    this.sharedMetadata.set('relationship', {
      showInCard: false,
      propertyType: 'relationship',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
    });

    // Add more common patterns as needed
  }

  /**
   * Prepare translations cache for efficient lookup
   */
  private prepareTranslationsCache(): void {
    if (!this.context.translations) return;

    // Cache all translations for efficient lookup
    Object.entries(this.context.translations).forEach(([key, value]) => {
      this.sharedTranslations.set(key, value);
    });
  }

  /**
   * Pre-calculate ALL property metadata that will be reused
   * This composition shouldn't change, so we calculate it once
   */
  private preCalculateAllPropertyMetadata(): void {
    const { options } = this.context;
    
    // Pre-calculate metadata for each property type
    this.preCalculatedMetadata.set('date', {
      showInCard: false,
      propertyType: 'date',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
      // Add date-specific metadata
      dateFormat: options.dateOptions?.dateFormat || options.dateFormat || 'YYYY-MM-DD',
      timezone: options.dateOptions?.timezone,
      includeTime: options.dateOptions?.includeTime || false,
      relativeTime: options.dateOptions?.relativeTime || false,
      locale: options.dateOptions?.locale || this.context.language,
    });

    this.preCalculatedMetadata.set('select', {
      showInCard: false,
      propertyType: 'select',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
      // Add select-specific metadata
      showLabels: options.selectOptions?.showLabels !== false,
      showIcons: options.selectOptions?.showIcons || false,
      showUrls: options.selectOptions?.showUrls || false,
      includeOptions: options.selectOptions?.includeOptions || false,
    });

    this.preCalculatedMetadata.set('relationship', {
      showInCard: false,
      propertyType: 'relationship',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
      // Add relationship-specific metadata
      nestedLevel: options.relationshipOptions?.nestedLevel || 1,
      includeEntityData: options.relationshipOptions?.includeEntityData || false,
      includeTemplates: options.relationshipOptions?.includeTemplates || false,
      maxRelationships: options.relationshipOptions?.maxRelationships,
    });

    this.preCalculatedMetadata.set('file', {
      showInCard: false,
      propertyType: 'file',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
      // Add file-specific metadata
      includeFileMetadata: options.fileOptions?.includeFileMetadata || false,
      includeThumbnails: options.fileOptions?.includeThumbnails || false,
      maxFileSize: options.fileOptions?.maxFileSize,
      allowedTypes: options.fileOptions?.allowedTypes,
    });

    this.preCalculatedMetadata.set('geolocation', {
      showInCard: false,
      propertyType: 'geolocation',
      isRequired: false,
      isMultiple: false,
      noLabel: false,
      fullWidth: false,
      obsolete: false,
      // Add geolocation-specific metadata
      precision: options.geolocationOptions?.precision || 4,
      format: options.geolocationOptions?.format || 'decimal',
      includeMapData: options.geolocationOptions?.includeMapData || false,
      combineGeolocation: options.geolocationOptions?.combineGeolocation || false,
    });
  }

  /**
   * Create formatted property efficiently by reusing pre-calculated metadata
   */
  createFormattedProperty(
    values: PropertyValue[],
    property: any,
    propertyType: string
  ): FormattedProperty {
    // Get pre-calculated metadata for this property type
    const preCalculatedMeta = this.preCalculatedMetadata.get(propertyType) || {};
    
    // Get translated label efficiently
    const translatedLabel = this.getTranslatedLabel(property);
    
    // Override with property-specific values (minimal changes)
    const propertyMetadata = this.applyPropertySpecificOverrides(property, preCalculatedMeta);

    return {
      values,
      label: property.label || property.name || property._fieldName,
      name: property._fieldName,
      translatedLabel,
      propertyMetadata,
      type: property.type,
      originalValue: property.value,
    };
  }

  /**
   * Get translated label efficiently using cache
   */
  private getTranslatedLabel(property: any): string | undefined {
    if (!this.context.options.translateLabels) return undefined;

    const translationKey = property.translateContext || property._fieldName;
    return this.sharedTranslations.get(translationKey);
  }

  /**
   * Apply property-specific overrides to pre-calculated metadata
   * This is much more efficient than rebuilding metadata from scratch
   */
  private applyPropertySpecificOverrides(
    property: any,
    preCalculatedMeta: any
  ): any {
    // Start with pre-calculated metadata (no changes needed for most properties)
    const metadata = { ...preCalculatedMeta };

    // Only override if property has specific values (minimal changes)
    if (property.showInCard !== undefined) metadata.showInCard = property.showInCard;
    if (property.required !== undefined) metadata.isRequired = property.required;
    if (property.multiple !== undefined) metadata.isMultiple = property.multiple;
    if (property.noLabel !== undefined) metadata.noLabel = property.noLabel;
    if (property.fullWidth !== undefined) metadata.fullWidth = property.fullWidth;
    if (property.obsolete !== undefined) metadata.obsolete = property.obsolete;

    // Add property-specific metadata only if present
    if (property.indexInTemplate !== undefined) metadata.indexInTemplate = property.indexInTemplate;
    if (property.parent !== undefined) metadata.parent = property.parent;
    if (property.translateContext !== undefined) metadata.translateContext = property.translateContext;
    if (property.fileName !== undefined) metadata.fileName = property.fileName;
    if (property.timeLinks !== undefined) metadata.timeLinks = property.timeLinks;
    if (property.relatedEntity !== undefined) metadata.relatedEntity = property.relatedEntity;
    if (property.inheritedType !== undefined) metadata.inheritedType = property.inheritedType;
    if (property.inheritedValue !== undefined) metadata.inheritedValue = property.inheritedValue;
    if (property.denormalizedProperty !== undefined) metadata.denormalizedProperty = property.denormalizedProperty;
    if (property.sortedBy !== undefined) metadata.sortedBy = property.sortedBy;
    if (property.timestamp !== undefined) metadata.timestamp = property.timestamp;
    if (property.style !== undefined) metadata.style = property.style;
    if (property.url !== undefined) metadata.url = property.url;
    if (property.icon !== undefined) metadata.icon = property.icon;

    // Add inheritance details
    metadata.isInherited = !!(
      property.inherited ||
      property.inheritedType ||
      property.inheritedValue ||
      property.originalValue
    );

    return metadata;
  }

  /**
   * Get processing statistics
   */
  getStats(): {
    sharedMetadataTypes: string[];
    preCalculatedMetadataTypes: string[];
    translationCacheSize: number;
    contextInfo: {
      language: string;
      hasTranslations: boolean;
      hasSettings: boolean;
      hasTemplates: boolean;
    };
  } {
    return {
      sharedMetadataTypes: Array.from(this.sharedMetadata.keys()),
      preCalculatedMetadataTypes: Array.from(this.preCalculatedMetadata.keys()),
      translationCacheSize: this.sharedTranslations.size,
      contextInfo: {
        language: this.context.language,
        hasTranslations: !!this.context.translations,
        hasSettings: !!this.context.settings,
        hasTemplates: !!this.context.templates,
      },
    };
  }
}
