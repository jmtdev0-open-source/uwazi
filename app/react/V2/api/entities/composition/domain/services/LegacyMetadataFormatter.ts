/**
 * Legacy Metadata Formatter
 * Encapsulates legacy formatting patterns from the existing Uwazi codebase
 */
import moment from 'moment';

export interface LegacyMetadataFormatter {
  formatProperty(property: any, _language: string): any;
  formatDate(timestamp: number, _language: string): string;
  formatDateRange(from: number, to: number, _language: string): string;
  formatMultiDate(dates: number[], _language: string): string[];
  formatMultiDateRange(
    dateRanges: Array<{ from: number; to: number }>,
    _language: string
  ): string[];
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
  formatProperty(property: any, _language: string): any {
    if (!property) {
      return property;
    }

    // Handle properties with value field (most common case)
    if (property.value !== undefined) {
      const value = property.value;

      // Handle date timestamps
      if (typeof value === 'number' && value > 1000000000) {
        return this.formatDate(value, _language);
      }

      // Handle date range objects
      if (typeof value === 'object' && value.from && value.to) {
        return this.formatDateRange(value.from, value.to, _language);
      }

      // Handle multidate arrays
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'number') {
        return this.formatMultiDate(value, _language);
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
          return this.formatDate(property.value, _language);
        case 'daterange':
          return this.formatDateRange(property.value?.from, property.value?.to, _language);
        case 'multidate':
          return this.formatMultiDate(property.value, _language);
        case 'multidaterange':
          return this.formatMultiDateRange(property.value, _language);
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
      return property
        .map(item => {
          if (typeof item === 'object' && item.value !== undefined) {
            if (typeof item.value === 'number' && item.value > 1000000000) {
              return this.formatDate(item.value, _language);
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

  formatDate(timestamp: number, __language: string): string {
    if (!timestamp) return '';
    return moment.utc(timestamp, 'X').format('ll');
  }

  formatDateRange(from: number, to: number, _language: string): string {
    if (!from && !to) return '';
    if (!from) return this.formatDate(to, _language);
    if (!to) return this.formatDate(from, _language);
    return `${this.formatDate(from, _language)} ~ ${this.formatDate(to, _language)}`;
  }

  formatMultiDate(dates: number[], _language: string): string[] {
    if (!Array.isArray(dates)) return [];
    return dates.map(date => this.formatDate(date, _language));
  }

  formatMultiDateRange(
    dateRanges: Array<{ from: number; to: number }>,
    _language: string
  ): string[] {
    if (!Array.isArray(dateRanges)) return [];
    return dateRanges.map(range => this.formatDateRange(range.from, range.to, _language));
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
      const option = property.options.find((opt: any) => opt.id === property.value);
      if (option) {
        return {
          ...property,
          formattedValue: {
            value: option.label,
            url: option.url,
            icon: option.icon,
          },
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
        const option = property.options.find((opt: any) => opt.id === value);
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
}
