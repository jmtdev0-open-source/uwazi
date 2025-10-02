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
    if (!property || !property.type) {
      return property;
    }

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
    if (!property || !property.options) return property;

    const option = property.options.find((opt: any) => opt.id === property.value);
    if (!option) return property;

    return {
      ...property,
      formattedValue: {
        value: option.label,
        url: option.url,
        icon: option.icon,
      },
    };
  }

  formatMultiSelect(property: any, _language: string): any {
    if (!property || !property.options || !Array.isArray(property.value)) return property;

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
