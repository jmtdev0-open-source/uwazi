/**
 * Legacy Metadata Formatter
 * Encapsulates legacy formatting patterns from the existing Uwazi codebase
 */
import moment from 'moment';
import { PropertySchema } from 'shared/types/commonTypes';

export interface MetadataFormatter {
  formatProperty(
    property: any,
    _language: string,
    dateFormat?: string,
    includeMetadata?: boolean
  ): any;
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
  formatNested(property: any, _language: string): any;
}

export class MetadataFormatterImpl implements MetadataFormatter {
  formatProperty(
    property: any,
    _language: string,
    dateFormat?: string,
    includeMetadata?: boolean
  ): any {
    if (!property) {
      return property;
    }

    if (property.type) {
      switch (property.type) {
        case 'date':
          return this.formatDate(property.value, _language, dateFormat);
        case 'daterange':
          return this.formatDateRange(
            property.value?.from,
            property.value?.to,
            _language,
            dateFormat
          );
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
        case 'nested':
          return this.formatNested(property, _language);
        default:
          return property;
      }
    }

    if (includeMetadata) {
      return this.buildPropertyMetadata(property);
    }

    return property;
  }

  formatDate(timestamp: number, __language: string, dateFormat?: string): any {
    if (!timestamp) return { originalValue: timestamp, formattedValue: '' };

    const format = dateFormat || 'YYYY-MM-DD';
    return {
      originalValue: timestamp,
      formattedValue: moment.utc(timestamp, 'X').format(format),
      displayValue: moment.utc(timestamp, 'X').format('ll'),
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
      displayValue: `${fromFormatted.displayValue} ~ ${toFormatted.displayValue}`,
    };
  }

  formatMultiDate(dates: number[], _language: string, dateFormat?: string): any {
    if (!Array.isArray(dates)) return { originalValue: dates, formattedValue: [] };

    const formattedDates = dates.map(date => this.formatDate(date, _language, dateFormat));
    return {
      originalValue: dates,
      formattedValue: formattedDates.map(d => d.formattedValue),
      displayValue: formattedDates.map(d => d.displayValue),
    };
  }

  formatMultiDateRange(
    dateRanges: Array<{ from: number; to: number }>,
    _language: string,
    dateFormat?: string
  ): any {
    if (!Array.isArray(dateRanges)) return { originalValue: dateRanges, formattedValue: [] };

    const formattedRanges = dateRanges.map(range =>
      this.formatDateRange(range.from, range.to, _language, dateFormat)
    );
    return {
      originalValue: dateRanges,
      formattedValue: formattedRanges.map(r => r.formattedValue),
      displayValue: formattedRanges.map(r => r.displayValue),
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
          displayValue: option.label,
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
        displayValue: formattedValues.map((v: any) => v.value).join(', '),
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

  private buildPropertyMetadata(property: PropertySchema): any {
    const metadata: any = {
      fieldName: property.name,
      propertyType: property.type,
      isInherited: this.isInheritedProperty(property),
      isRequired: property.required || false,
      // isMultiple: property.multiple || false,
      showInCard: property.showInCard || false,
      noLabel: property.noLabel || false,
      fullWidth: property.fullWidth || false,
      // obsolete: property.obsolete || false,
      // indexInTemplate: property.indexInTemplate,
      // parent: property.parent,
      // translateContext: property.translateContext,
      // fileName: property.fileName,
      // timeLinks: property.timeLinks,
      // relatedEntity: property.relatedEntity,
      // inheritedType: property.inheritedType,
      // inheritedValue: property.inheritedValue,
      // sortedBy: property.sortedBy,
      // timestamp: property.timestamp,
      // style: property.style,
      // url: property.url,
      // icon: property.icon
    };

    // Add inheritance details if inherited
    if (property.inherit) {
      metadata.propertyMetadata = {
        inheritedType: property.inherit.type,
        originalValue: property.content,
        inheritedFrom: property.inherit.property || 'Unknown',
      };
    }

    if (metadata.propertyType === 'relationship') {
      metadata.propertyMetadata = {
        relationType: property.relationType,
      };
    }

    // Add file details if it's a file property
    // if (metadata.propertyType === 'image' || metadata.propertyType === 'media') {
    //   metadata.fileDetails = {
    //     fileName: property.fileName,
    //     timeLinks: property.timeLinks,
    //     fileType: property.fileType,
    //     mimeType: property.mimeType,
    //     size: property.size
    //   };
    // }

    return metadata;
  }

  private isInheritedProperty(property: any): boolean {
    return !!(
      property.inherited ||
      property.inheritedType ||
      property.inheritedValue ||
      property.originalValue
    );
  }
}
