/**
 * Elegant Select Processor
 * Processes select properties using shared data and context
 */
import { PropertyTypeProcessor } from './ElegantBatchProcessor';
import { 
  FormattedProperty, 
  PropertyValue, 
  BatchProcessingContext 
} from './PropertyStructure';
import { SharedPropertyFactory } from './SharedPropertyFactory';

export class ElegantSelectProcessor implements PropertyTypeProcessor {
  readonly name = 'ElegantSelectProcessor';
  readonly priority = 15;
  readonly propertyTypes = ['select', 'multiselect'];
  
  private sharedPropertyFactory: SharedPropertyFactory;

  constructor() {
    // Will be initialized with context
  }

  /**
   * Initialize with context (called by ElegantBatchProcessor)
   */
  initialize(context: BatchProcessingContext): void {
    this.sharedPropertyFactory = new SharedPropertyFactory(context);
  }

  /**
   * Process all select properties in batch using shared data
   */
  async processBatch(
    properties: any[],
    sharedData: any,
    context: BatchProcessingContext
  ): Promise<Map<string, FormattedProperty>> {
    const results = new Map<string, FormattedProperty>();
    
    // Use shared select formatting utilities
    const { selectFormatting, translations } = sharedData;
    const { showLabels, showIcons, showUrls, includeOptions } = selectFormatting;

    // Process all select properties using shared utilities
    for (const property of properties) {
      try {
        const key = `${property._entityId}:${property._fieldName}`;
        const values = this.formatSelectProperty(property, selectFormatting, translations);
        const formattedProperty = this.sharedPropertyFactory.createFormattedProperty(values, property, 'select');
        results.set(key, formattedProperty);
      } catch (error) {
        console.error(`Error processing select property ${property._fieldName}:`, error);
      }
    }

    return results;
  }

  /**
   * Format a single select property using shared utilities
   */
  private formatSelectProperty(
    property: any,
    selectFormatting: any,
    translations: Record<string, any>
  ): PropertyValue[] {
    const { showLabels, showIcons, showUrls, includeOptions } = selectFormatting;

    if (property.value !== undefined && !property.options) {
      // Simple value without options
      const values = Array.isArray(property.value) ? property.value : [property.value];
      
      return values.map((value: any): PropertyValue => {
        const label = showLabels ? value.toString() : '';
        return {
          value,
          label: showLabels ? label : undefined,
          displayValue: showLabels ? label : '',
          icon: showIcons ? property.icon : undefined,
          url: showUrls ? property.url : undefined,
        };
      });
    }

    // Handle properties with options
    if (property.options && Array.isArray(property.options)) {
      const values = Array.isArray(property.value) ? property.value : [property.value];
      
      return values.map((selectedValue: any): PropertyValue => {
        const option = property.options.find((opt: any) => opt.value === selectedValue);
        
        if (!option) {
          return {
            value: selectedValue,
            label: selectedValue.toString(),
            displayValue: selectedValue.toString(),
          };
        }

        // Apply translations if available
        const translatedLabel = translations[option.translateContext || option.label] || option.label;

        return {
          value: selectedValue,
          label: showLabels ? translatedLabel : undefined,
          displayValue: showLabels ? translatedLabel : '',
          icon: showIcons ? option.icon : undefined,
          url: showUrls ? option.url : undefined,
        };
      });
    }

    return [{
      value: property.value,
      label: property.value?.toString() || '',
      displayValue: property.value?.toString() || '',
    }];
  }

}
