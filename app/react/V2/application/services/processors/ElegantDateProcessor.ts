/**
 * Elegant Date Processor
 * Processes date properties using shared data and context
 */
import moment from 'moment';
import { PropertyTypeProcessor } from './ElegantBatchProcessor';
import { 
  FormattedProperty, 
  PropertyValue, 
  BatchProcessingContext 
} from './PropertyStructure';
import { SharedPropertyFactory } from './SharedPropertyFactory';

export class ElegantDateProcessor implements PropertyTypeProcessor {
  readonly name = 'ElegantDateProcessor';
  readonly priority = 10;
  readonly propertyTypes = ['date', 'multidate', 'daterange', 'multidaterange'];
  
  private sharedPropertyFactory: SharedPropertyFactory | null = null;

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
   * Process all date properties in batch using shared data
   */
  async processBatch(
    properties: any[],
    sharedData: any,
    context: BatchProcessingContext
  ): Promise<Map<string, FormattedProperty>> {
    const results = new Map<string, FormattedProperty>();
    
    // Use shared date formatting utilities
    const { dateFormatting } = sharedData;
    const { format, timezone, includeTime, relativeTime, locale } = dateFormatting;

    // Process all date properties using shared utilities
    for (const property of properties) {
      try {
        const key = `${property._entityId}:${property._fieldName}`;
        const values = this.formatDateProperty(property, dateFormatting);
        const formattedProperty = this.sharedPropertyFactory.createFormattedProperty(values, property, 'date');
        results.set(key, formattedProperty);
      } catch (error) {
        console.error(`Error processing date property ${property._fieldName}:`, error);
      }
    }

    return results;
  }

  /**
   * Format a single date property using shared utilities
   */
  private formatDateProperty(property: any, dateFormatting: any): PropertyValue[] {
    if (property.type === 'date' || property.type === 'multidate') {
      return this.formatSingleDate(property, dateFormatting);
    }
    
    if (property.type === 'daterange' || property.type === 'multidaterange') {
      return this.formatDateRange(property, dateFormatting);
    }

    return [{
      value: property.value,
      label: property.value?.toString() || '',
      displayValue: property.value?.toString() || '',
    }];
  }

  private formatSingleDate(property: any, dateFormatting: any): PropertyValue[] {
    const { format, timezone, includeTime, relativeTime, locale } = dateFormatting;
    const values = Array.isArray(property.value) ? property.value : [property.value];
    
    return values.map((timestamp: number): PropertyValue => {
      if (!timestamp) return { 
        value: timestamp, 
        label: '', 
        displayValue: '',
        formattedValue: '',
        localizedValue: ''
      };

      let momentInstance = moment.utc(timestamp, 'X');
      momentInstance = momentInstance.locale(locale);
      
      if (timezone) {
        momentInstance = momentInstance.tz(timezone);
      }

      // Version 1: Raw timestamp (always included)
      const rawValue = timestamp;

      // Version 2: Formatted date based on dateFormat
      let formattedValue = '';
      if (relativeTime) {
        formattedValue = momentInstance.fromNow();
      } else {
        const baseFormat = includeTime ? `${format} HH:mm:ss` : format;
        formattedValue = momentInstance.format(baseFormat);
      }

      // Version 3: Localized date converted to UI language
      const localizedValue = momentInstance.format('ll' + (includeTime ? ' HH:mm' : ''));

      return {
        value: rawValue,                    // Version 1: Raw timestamp
        formattedValue,                     // Version 2: Formatted based on dateFormat
        localizedValue,                     // Version 3: Localized to UI language
        displayValue: localizedValue,       // Default display (localized)
        label: formattedValue,              // Label (formatted)
      };
    });
  }

  private formatDateRange(property: any, dateFormatting: any): PropertyValue[] {
    const { format, timezone, includeTime, relativeTime, locale } = dateFormatting;
    const ranges = Array.isArray(property.value) ? property.value : [property.value];
    
    return ranges.map((range: any): PropertyValue => {
      const { from, to } = range;
      
      if (!from && !to) return { 
        value: range, 
        formattedValue: '',
        localizedValue: '',
        displayValue: ''
      };
      
      if (!from) {
        const toFormatted = this.formatSingleDate({ value: to }, dateFormatting);
        return {
          value: range,
          formattedValue: toFormatted[0]?.formattedValue || '',
          localizedValue: toFormatted[0]?.localizedValue || '',
          displayValue: toFormatted[0]?.displayValue || '',
        };
      }
      
      if (!to) {
        const fromFormatted = this.formatSingleDate({ value: from }, dateFormatting);
        return {
          value: range,
          formattedValue: fromFormatted[0]?.formattedValue || '',
          localizedValue: fromFormatted[0]?.localizedValue || '',
          displayValue: fromFormatted[0]?.displayValue || '',
        };
      }

      const fromFormatted = this.formatSingleDate({ value: from }, dateFormatting);
      const toFormatted = this.formatSingleDate({ value: to }, dateFormatting);

      return {
        value: range,                    // Version 1: Raw range object
        formattedValue: `${fromFormatted[0]?.formattedValue || ''} ~ ${toFormatted[0]?.formattedValue || ''}`,  // Version 2: Formatted range
        localizedValue: `${fromFormatted[0]?.localizedValue || ''} ~ ${toFormatted[0]?.localizedValue || ''}`,  // Version 3: Localized range
        displayValue: `${fromFormatted[0]?.localizedValue || ''} ~ ${toFormatted[0]?.localizedValue || ''}`,    // Default display (localized)
      };
    });
  }

}
