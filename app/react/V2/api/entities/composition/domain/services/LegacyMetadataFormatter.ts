/**
 * Legacy Metadata Formatter
 * Encapsulates legacy formatting patterns from the existing Uwazi codebase
 */
import moment from 'moment';

export interface LegacyMetadataFormatter {
  formatProperty(property: any, _language: string, dateFormat?: string, includeMetadata?: boolean): any;
  formatDate(timestamp: number, _language: string, dateFormat?: string): any;
  formatDateRange(from: number, to: number, _language: string, dateFormat?: string): any;
  formatMultiDate(dates: number[], _language: string, dateFormat?: string): any;
  formatMultiDateRange(
    dateRanges: Array<{ from: number; to: number }>,
    _language: string,
    dateFormat?: string
  ): any;
  formatSelect(property: any, _language: string): any;
  formatMultiSelect(property: any, _language: string): any;
  formatGeolocation(property: any, _language: string): any;
  formatImage(property: any, _language: string): any;
  formatMedia(property: any, _language: string): any;
  formatMarkdown(property: any, _language: string): any;
  formatRelationship(property: any, _language: string): any;
  formatInherit(property: any, _language: string): any;
  formatNewRelationshipWithInherit(property: any, _language: string): any;
  formatNested(property: any, _language: string): any;
}

export class LegacyMetadataFormatterImpl implements LegacyMetadataFormatter {
  formatProperty(property: any, _language: string, dateFormat?: string, includeMetadata?: boolean): any {
    if (!property) {
      return property;
    }

    // Handle properties with value field (most common case)
    if (property.value !== undefined) {
      const value = property.value;

      // Handle date timestamps
      if (typeof value === 'number' && value > 1000000000) {
        return this.formatDate(value, _language, dateFormat);
      }

      // Handle date range objects
      if (typeof value === 'object' && value.from && value.to) {
        return this.formatDateRange(value.from, value.to, _language, dateFormat);
      }

      // Handle multidate arrays
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'number') {
        return this.formatMultiDate(value, _language, dateFormat);
      }

      // Handle date arrays with objects (common case: [{ value: timestamp }])
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0].value) {
        // Check if it's a date range array
        if (typeof value[0].value === 'object' && value[0].value.from && value[0].value.to) {
          const dateRanges = value.map(item => item.value).filter(val => typeof val === 'object' && val.from && val.to);
          if (dateRanges.length > 0) {
            return this.formatMultiDateRange(dateRanges, _language, dateFormat);
          }
        }
        // Check if it's a regular date array
        const timestamps = value.map(item => item.value).filter(val => typeof val === 'number' && val > 1000000000);
        if (timestamps.length > 0) {
          return this.formatMultiDate(timestamps, _language, dateFormat);
        }
      }

      // Handle single date object (common case: { value: timestamp })
      if (typeof value === 'object' && value.value && typeof value.value === 'number' && value.value > 1000000000) {
        return this.formatDate(value.value, _language, dateFormat);
      }

      // Handle single date range object (common case: { value: { from: timestamp1, to: timestamp2 } })
      if (typeof value === 'object' && value.value && typeof value.value === 'object' && value.value.from && value.value.to) {
        return this.formatDateRange(value.value.from, value.value.to, _language, dateFormat);
      }

      // Handle select/multiselect arrays (common case: [{ value: "uuid", label: "Label" }])
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0].value && value[0].label) {
        // This is a select/multiselect array, format it properly
        if (value.length === 1) {
          // Single select
          return this.formatSelect({ value: value[0].value, label: value[0].label, url: value[0].url, icon: value[0].icon }, _language);
        } else {
          // Multi select
          return this.formatMultiSelect({ value: value.map(item => item.value), options: value }, _language);
        }
      }

      // Handle single select object (common case: { value: "uuid", label: "Label" })
      if (typeof value === 'object' && value.value && value.label) {
        return this.formatSelect({ value: value.value, label: value.label, url: value.url, icon: value.icon }, _language);
      }

      // Handle geolocation objects
      if (typeof value === 'object' && value.lat && value.lon) {
        return this.formatGeolocation({ value }, _language);
      }

      // Handle link objects
      if (typeof value === 'object' && value.label && value.url) {
        return `${value.label} (${value.url})`;
      }

      // Handle image paths
      if (typeof value === 'string' && value.includes('/api/files/')) {
        return `Image: ${value.split('/').pop()}`;
      }

      // Handle simple string values
      if (typeof value === 'string') {
        return value;
      }

      // Handle other object values
      return String(value);
    }

    // Handle properties with type field (legacy format)
    if (property.type) {
      switch (property.type) {
        case 'date':
          return this.formatDate(property.value, _language, dateFormat);
        case 'daterange':
          return this.formatDateRange(property.value?.from, property.value?.to, _language, dateFormat);
        case 'multidate':
          return this.formatMultiDate(property.value, _language, dateFormat);
        case 'multidaterange':
          return this.formatMultiDateRange(property.value, _language, dateFormat);
        case 'select':
          return this.formatSelect(property, _language);
        case 'multiselect':
          return this.formatMultiSelect(property, _language);
        case 'geolocation':
          return this.formatGeolocation(property, _language);
        case 'image':
          return this.formatImage(property, _language);
        case 'media':
          return this.formatMedia(property, _language);
        case 'markdown':
          return this.formatMarkdown(property, _language);
        case 'relationship':
          return this.formatRelationship(property, _language);
        case 'inherit':
          return this.formatInherit(property, _language);
        case 'newRelationshipWithInherit':
          return this.formatNewRelationshipWithInherit(property, _language);
        case 'nested':
          return this.formatNested(property, _language);
        default:
          return property;
      }
    }

    // Handle array properties
    if (Array.isArray(property)) {
      if (property.length === 0) return 'No values';
      
      // Check if this is a date array, date range array, or select array
      const firstItem = property[0];
      if (typeof firstItem === 'object' && firstItem.value) {
        // Check if it's a date range array
        if (typeof firstItem.value === 'object' && firstItem.value.from && firstItem.value.to) {
          const dateRanges = property.map(item => item.value).filter(val => typeof val === 'object' && val.from && val.to);
          if (dateRanges.length > 0) {
            return this.formatMultiDateRange(dateRanges, _language, dateFormat);
          }
        }
        // Check if it's a regular date array
        if (typeof firstItem.value === 'number' && firstItem.value > 1000000000) {
          const timestamps = property.map(item => item.value).filter(val => typeof val === 'number' && val > 1000000000);
          if (timestamps.length > 0) {
            return this.formatMultiDate(timestamps, _language, dateFormat);
          }
        }
        // Check if it's a select/multiselect array
        if (typeof firstItem.value === 'string' && firstItem.label) {
          if (property.length === 1) {
            // Single select
            return this.formatSelect({ value: firstItem.value, label: firstItem.label, url: firstItem.url, icon: firstItem.icon }, _language);
          } else {
            // Multi select
            return this.formatMultiSelect({ value: property.map(item => item.value), options: property }, _language);
          }
        }
      }
      
      return property
        .map(item => {
          if (typeof item === 'object' && item.value !== undefined) {
            if (typeof item.value === 'number' && item.value > 1000000000) {
              return this.formatDate(item.value, _language, dateFormat);
            }
            return item.value;
          }
          return item.displayValue || item.name || item.title || item.label || JSON.stringify(item);
        })
        .join(', ');
    }

    // Handle object properties without value field
    if (typeof property === 'object') {
      const value = property.name || property.title || property.label || property.text;
      if (value) {
        return value;
      }

      // Last resort: show a summary
      const keys = Object.keys(property);
      if (keys.length > 0) {
        return `Object with ${keys.length} properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
      }

      return 'Empty object';
    }

    // Handle primitive values
    return property;
  }

  formatDate(timestamp: number, __language: string, dateFormat?: string): any {
    if (!timestamp) return { originalValue: timestamp, formattedValue: '' };
    
    const format = dateFormat || 'YYYY-MM-DD';
    return {
      originalValue: timestamp,
      formattedValue: moment.utc(timestamp, 'X').format(format),
      displayValue: moment.utc(timestamp, 'X').format('ll')
    };
  }

  formatDateRange(from: number, to: number, _language: string, dateFormat?: string): any {
    if (!from && !to) return { originalValue: { from, to }, formattedValue: '' };
    if (!from) return this.formatDate(to, _language, dateFormat);
    if (!to) return this.formatDate(from, _language, dateFormat);
    
    const fromFormatted = this.formatDate(from, _language, dateFormat);
    const toFormatted = this.formatDate(to, _language, dateFormat);
    
    return {
      originalValue: { from, to },
      formattedValue: `${fromFormatted.formattedValue} ~ ${toFormatted.formattedValue}`,
      displayValue: `${fromFormatted.displayValue} ~ ${toFormatted.displayValue}`
    };
  }

  formatMultiDate(dates: number[], _language: string, dateFormat?: string): any {
    if (!Array.isArray(dates)) return { originalValue: dates, formattedValue: [] };
    
    const formattedDates = dates.map(date => this.formatDate(date, _language, dateFormat));
    return {
      originalValue: dates,
      formattedValue: formattedDates.map(d => d.formattedValue),
      displayValue: formattedDates.map(d => d.displayValue)
    };
  }

  formatMultiDateRange(
    dateRanges: Array<{ from: number; to: number }>,
    _language: string,
    dateFormat?: string
  ): any {
    if (!Array.isArray(dateRanges)) return { originalValue: dateRanges, formattedValue: [] };
    
    const formattedRanges = dateRanges.map(range => this.formatDateRange(range.from, range.to, _language, dateFormat));
    return {
      originalValue: dateRanges,
      formattedValue: formattedRanges.map(r => r.formattedValue),
      displayValue: formattedRanges.map(r => r.displayValue)
    };
  }

  formatSelect(property: any, _language: string): any {
    if (!property) return property;

    // Handle case where property has a value but no options (direct value)
    if (property.value !== undefined && !property.options) {
      return {
        ...property,
        formattedValue: {
          value: property.value,
          url: property.url,
          icon: property.icon,
        },
      };
    }

    // Handle case where property has options
    if (property.options && Array.isArray(property.options)) {
      const option = property.options.find((opt: any) => opt.value === property.value);
      if (option) {
        return {
          ...property,
          formattedValue: {
            value: option.label,
            url: option.url,
            icon: option.icon,
          },
          displayValue: option.label
        };
      }
    }

    // Handle case where property.value is already a formatted object
    if (typeof property.value === 'object' && property.value.value) {
      return {
        ...property,
        formattedValue: property.value,
      };
    }

    // Fallback: return the property as-is with basic formatting
    return {
      ...property,
      formattedValue: {
        value: property.value || property.label || property.name || 'Unknown',
        url: property.url,
        icon: property.icon,
      },
    };
  }

  formatMultiSelect(property: any, _language: string): any {
    if (!property) return property;

    // Handle case where property.value is not an array
    if (!Array.isArray(property.value)) {
      return {
        ...property,
        formattedValue: [
          {
            value: property.value || property.label || property.name || 'Unknown',
            url: property.url,
            icon: property.icon,
          },
        ],
      };
    }

    // Handle case where property has options
    if (property.options && Array.isArray(property.options)) {
      const formattedValues = property.value.map((value: any) => {
        const option = property.options.find((opt: any) => opt.value === value);
        return option
          ? {
              value: option.label,
              url: option.url,
              icon: option.icon,
            }
          : { value };
      });

      return {
        ...property,
        formattedValue: formattedValues,
        displayValue: formattedValues.map((v: any) => v.value).join(', ')
      };
    }

    // Handle case where property.value is already formatted objects
    if (
      property.value.length > 0 &&
      typeof property.value[0] === 'object' &&
      property.value[0].value
    ) {
      return {
        ...property,
        formattedValue: property.value,
      };
    }

    // Fallback: format values as-is
    const formattedValues = property.value.map((value: any) => ({
      value: value || 'Unknown',
      url: undefined,
      icon: undefined,
    }));

    return {
      ...property,
      formattedValue: formattedValues,
    };
  }

  formatGeolocation(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        visualization: property.value.visualization || 'map',
      },
    };
  }

  formatImage(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        style: property.value.style || 'default',
        label: property.value.label || '',
      },
    };
  }

  formatMedia(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        style: property.value.style || 'default',
        label: property.value.label || '',
      },
    };
  }

  formatMarkdown(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        html: property.value.html || property.value,
      },
    };
  }

  formatRelationship(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        thesaurus: property.value.thesaurus || [],
      },
    };
  }

  formatInherit(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        inherited: true,
        originalValue: property.value.originalValue,
      },
    };
  }

  formatNewRelationshipWithInherit(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        inherited: true,
        newRelationship: true,
        originalValue: property.value.originalValue,
      },
    };
  }

  formatNested(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        ...property.value,
        nested: true,
        children: property.value.children || [],
      },
    };
  }

  /**
   * Build property metadata information
   */
  private buildPropertyMetadata(property: any, fieldName: string): any {
    const metadata: any = {
      fieldName: fieldName,
      propertyType: this.detectPropertyType(property),
      isInherited: this.isInheritedProperty(property),
      isRequired: property.required || false,
      isMultiple: property.multiple || false,
      showInCard: property.showInCard || false,
      noLabel: property.noLabel || false,
      fullWidth: property.fullWidth || false,
      obsolete: property.obsolete || false,
      indexInTemplate: property.indexInTemplate,
      parent: property.parent,
      translateContext: property.translateContext,
      fileName: property.fileName,
      timeLinks: property.timeLinks,
      relatedEntity: property.relatedEntity,
      inheritedType: property.inheritedType,
      inheritedValue: property.inheritedValue,
      denormalizedProperty: property.denormalizedProperty,
      sortedBy: property.sortedBy,
      timestamp: property.timestamp,
      style: property.style,
      url: property.url,
      icon: property.icon
    };

    // Add inheritance details if inherited
    if (metadata.isInherited) {
      metadata.inheritanceDetails = {
        inheritedType: property.inheritedType,
        inheritedValue: property.inheritedValue,
        originalValue: property.originalValue,
        inheritedFrom: property.inheritedFrom || 'Unknown'
      };
    }

    // Add relationship details if it's a relationship property
    if (metadata.propertyType === 'relationship') {
      metadata.relationshipDetails = {
        thesaurus: property.thesaurus || [],
        entityType: property.entityType,
        relationshipType: property.relationshipType,
        hub: property.hub,
        hasNewRelationships: property.hasNewRelationships || false
      };
    }

    // Add file details if it's a file property
    if (metadata.propertyType === 'image' || metadata.propertyType === 'media') {
      metadata.fileDetails = {
        fileName: property.fileName,
        timeLinks: property.timeLinks,
        fileType: property.fileType,
        mimeType: property.mimeType,
        size: property.size
      };
    }

    return metadata;
  }

  /**
   * Detect the property type based on the property structure
   */
  private detectPropertyType(property: any): string {
    if (property.type) return property.type;
    
    if (property.value !== undefined) {
      if (typeof property.value === 'number' && property.value > 1000000000) return 'date';
      if (typeof property.value === 'object' && property.value.from && property.value.to) return 'daterange';
      if (Array.isArray(property.value)) {
        if (property.value.length > 0 && typeof property.value[0] === 'number') return 'multidate';
        if (property.value.length > 0 && typeof property.value[0] === 'object' && property.value[0].from && property.value[0].to) return 'multidaterange';
        if (property.value.length > 0 && typeof property.value[0] === 'object' && property.value[0].value && property.value[0].label) return 'multiselect';
      }
      if (typeof property.value === 'object' && property.value.value && property.value.label) return 'select';
      if (typeof property.value === 'object' && property.value.lat && property.value.lon) return 'geolocation';
      if (typeof property.value === 'string' && property.value.includes('/api/files/')) {
        if (property.value.includes('.mp4') || property.value.includes('.avi') || property.value.includes('.mov')) return 'media';
        return 'image';
      }
    }
    
    return 'text';
  }

  /**
   * Check if a property is inherited
   */
  private isInheritedProperty(property: any): boolean {
    return !!(property.inherited || property.inheritedType || property.inheritedValue || property.originalValue);
  }
}
