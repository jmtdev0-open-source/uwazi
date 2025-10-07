/**
 * Property Value Builder
 * Creates unified property value structures across all property types
 */
import moment from 'moment';
import {
  PropertyValue,
  DatePropertyValue,
  DateRangePropertyValue,
  SelectPropertyValue,
  RelationshipPropertyValue,
  GeolocationPropertyValue,
  FilePropertyValue,
  MarkdownPropertyValue,
  InheritPropertyValue,
  NestedPropertyValue,
  AnyPropertyValue,
  NormalizedPropertyDescriptor,
} from '../../domain/entities/PropertyValue';

export class PropertyValueBuilder {
  // Unified type mapping - eliminates duplication
  private readonly typeMapping: Record<string, string> = {
    date: 'date',
    multidate: 'date',
    daterange: 'daterange',
    multidaterange: 'daterange',
    select: 'select',
    multiselect: 'select',
    image: 'file',
    media: 'file',
    geolocation: 'geolocation',
    markdown: 'markdown',
    relationship: 'relationship',
    inherit: 'inherit',
    nested: 'nested',
  };

  private readonly handlers: Record<
    string,
    (property: any, language: string, dateFormat?: string) => any
  > = {
    date: (p, l, f) => this.formatDate(p?.value, l, f),
    daterange: (p, l, f) => this.formatDateRange(p?.value?.from, p?.value?.to, l, f),
    select: (p, l) => this.formatSelect(p, l),
    file: (p, l) => this.formatFile(p, l),
    geolocation: (p, l) => this.formatGeolocation(p, l),
    markdown: (p, l) => this.formatMarkdown(p, l),
    relationship: (p, l) => this.formatRelationship(p, l),
    inherit: (p, l) => this.formatInherit(p, l),
    nested: (p, l) => this.formatNested(p, l),
  };

  constructor(
    private readonly dateFormat: string = 'YYYY-MM-DD',
    private readonly language: string = 'en'
  ) {}

  buildPropertyValues(descriptor: NormalizedPropertyDescriptor): AnyPropertyValue[] {
    const { type, rawValue, lookups } = descriptor;

    switch (type) {
      case 'date':
      case 'multidate':
        return this.buildDateValues(descriptor);
      case 'daterange':
      case 'multidaterange':
        return this.buildDateRangeValues(descriptor);
      case 'select':
      case 'multiselect':
        return this.buildSelectValues(descriptor);
      case 'relationship':
        return this.buildRelationshipValues(descriptor);
      case 'geolocation':
        return this.buildGeolocationValues(descriptor);
      case 'image':
      case 'media':
        return this.buildFileValues(descriptor);
      case 'markdown':
        return this.buildMarkdownValues(descriptor);
      case 'inherit':
        return this.buildInheritValues(descriptor);
      case 'nested':
        return this.buildNestedValues(descriptor);
      default:
        return this.buildGenericValues(descriptor);
    }
  }

  // Public interface methods (merged from MetadataFormatter)
  
  // Legacy interface (for backward compatibility)
  formatProperty(
    property: any,
    _language: string,
    dateFormat?: string,
    includeMetadata?: boolean
  ): any {
    if (!property) {
      return property;
    }

    // Use unified type mapping to eliminate duplication
    const unifiedType = this.typeMapping[property.type];
    if (unifiedType && this.handlers[unifiedType]) {
      return this.handlers[unifiedType](property, _language, dateFormat);
    }

    if (includeMetadata) {
      return this.buildPropertyMetadata(property);
    }

    return property;
  }

  // Unified interface using normalized descriptors
  formatNormalizedProperty(descriptor: NormalizedPropertyDescriptor): any {
    const { type, values } = descriptor;

    // Use the pre-computed values from the unified structure
    if (values.length === 0) {
      return {
        ...descriptor,
        formattedValue: null,
        displayValue: 'No data',
        label: 'No data',
      };
    }

    // Unified handling: always return arrays for consistency
    return {
      ...descriptor,
      formattedValue: values.map(v => v.formattedValue),
      displayValue: values.map(v => v.displayValue).join(', '),
      label: values.map(v => v.label).join(', '),
      // Keep individual values for detailed access
      values: values,
    };
  }

  // Unified type handlers (no single vs multi distinction)
  formatDate(timestamp: number, _language: string, dateFormat?: string): any {
    if (!timestamp) return { originalValue: timestamp, formattedValue: '', displayValue: '' };

    const format = dateFormat || this.dateFormat;
    const formatted = moment.utc(timestamp, 'X').format(format);
    const display = moment.utc(timestamp, 'X').format('ll');

    return {
      originalValue: timestamp,
      formattedValue: formatted,
      displayValue: display,
      // Match sample structure
      values: [{ value: timestamp, label: formatted, displayValue: display }],
    };
  }

  formatDateRange(from: number, to: number, _language: string, dateFormat?: string): any {
    if (!from && !to) return { originalValue: { from, to }, formattedValue: '' };
    if (!from) return this.formatDate(to, _language, dateFormat);
    if (!to) return this.formatDate(from, _language, dateFormat);

    const fromFormatted = this.formatDate(from, _language, dateFormat);
    const toFormatted = this.formatDate(to, _language, dateFormat);

    const rangeValue = { from, to };
    const rangeLabel = `${fromFormatted.formattedValue} ~ ${toFormatted.formattedValue}`;
    const rangeDisplay = `${fromFormatted.displayValue} ~ ${toFormatted.displayValue}`;

    return {
      originalValue: rangeValue,
      formattedValue: rangeLabel,
      displayValue: rangeDisplay,
      // Match sample structure
      values: [{ value: rangeValue, label: rangeLabel, displayValue: rangeDisplay }],
    };
  }

  formatSelect(property: any, _language: string): any {
    if (!property) return property;

    // Handle case where property has a value but no options (direct value)
    if (property.value !== undefined && !property.options) {
      const value = property.value;
      const label = value.toString();
      return {
        ...property,
        formattedValue: {
          value,
          label,
        },
        displayValue: label,
        // Match sample structure
        values: [{ value, label, displayValue: label, icon: property.icon, url: property.url }],
      };
    }

    // Handle case with options
    if (property.options && property.options.length > 0) {
      const option = property.options.find((opt: any) => opt.value === property.value);
      if (option) {
        return {
          ...property,
          formattedValue: {
            value: property.value,
            label: option.label,
            icon: option.icon,
            url: option.url,
          },
          displayValue: option.label,
          // Match sample structure
          values: [
            {
              value: property.value,
              label: option.label,
              displayValue: option.label,
              icon: option.icon,
              url: option.url,
            },
          ],
        };
      }
    }

    // Fallback for unknown values
    return {
      ...property,
      formattedValue: {
        value: property.value,
        label: property.value?.toString() || 'Unknown',
      },
      displayValue: property.value?.toString() || 'Unknown',
      // Match sample structure
      values: [property.value],
    };
  }

  formatGeolocation(property: any, _language: string): any {
    if (!property || !property.value) return property;

    const value = property.value;
    const lat = value.latitude || value.lat;
    const lon = value.longitude || value.lon;
    const label = `${lat}°N, ${lon}°E`;

    return {
      ...property,
      formattedValue: {
        lat,
        lon,
        visualization: value.visualization || 'map',
      },
      displayValue: label,
      // Match sample structure
      values: [{ value: { latitude: lat, longitude: lon }, label, displayValue: label }],
    };
  }

  formatFile(property: any, _language: string): any {
    return this.formatFileLike(property, _language);
  }

  formatMarkdown(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        html: property.value.html || property.value,
        text: this.stripHtml(property.value.html || property.value),
      },
      displayValue: this.stripHtml(property.value.html || property.value),
      // Match sample structure
      values: [{ value: property.value, label: this.stripHtml(property.value.html || property.value), displayValue: this.stripHtml(property.value.html || property.value) }],
    };
  }

  formatRelationship(property: any, _language: string): any {
    if (!property || !property.value) return property;

    // Handle relationship values array (as shown in sample)
    const values = Array.isArray(property.value) ? property.value : [property.value];
    const isInherited = property.inherited === true;

    const relationshipValues = values.map((rel: any) => {
      const baseValue = {
        value: rel.value || rel,
        label: rel.label || rel.displayValue || rel.toString(),
        displayValue: rel.displayValue || rel.label || rel.toString(),
      };

      // Only add icon and url for non-inherited relationships
      if (!isInherited) {
        return {
          ...baseValue,
          icon: rel.icon || '',
          url: rel.url || '',
        };
      }

      return baseValue;
    });

    return {
      ...property,
      formattedValue: {
        ...property.value,
        thesaurus: property.value.thesaurus || [],
      },
      displayValue: relationshipValues.map((r: any) => r.label).join(', '),
      // Match sample structure
      values: relationshipValues,
    };
  }

  formatInherit(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        originalValue: property.value.originalValue,
        inherited: true,
        inheritedFrom: property.value.inheritedFrom || 'Unknown',
      },
      displayValue: `Inherited: ${property.value.originalValue}`,
      // Match sample structure
      values: [{ value: property.value.originalValue, label: `Inherited: ${property.value.originalValue}`, displayValue: `Inherited: ${property.value.originalValue}` }],
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
      displayValue: 'Nested content',
      // Match sample structure
      values: [{ value: property.value, label: 'Nested content', displayValue: 'Nested content' }],
    };
  }

  private buildDateValues(descriptor: NormalizedPropertyDescriptor): DatePropertyValue[] {
    const { rawValue } = descriptor;
    if (rawValue === undefined || rawValue === null) return [];

    const list: number[] = Array.isArray(rawValue)
      ? rawValue.map(v => (typeof v === 'number' ? v : parseInt(v)))
      : [typeof rawValue === 'number' ? rawValue : parseInt(rawValue)];

    return list.map(timestamp => {
      const formatted = this.formatDate(timestamp, this.language);
      return {
        value: timestamp,
        label: formatted.formattedValue, // Use formatted value as label
        displayValue: formatted.displayValue,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };
    });
  }

  private buildDateRangeValues(descriptor: NormalizedPropertyDescriptor): DateRangePropertyValue[] {
    const { rawValue } = descriptor;
    if (!rawValue) return [];

    const list: Array<{ from?: number; to?: number }> = Array.isArray(rawValue)
      ? rawValue.map(r => ({ from: r.from, to: r.to }))
      : [{ from: rawValue.from, to: rawValue.to }];

    return list.map(range => {
      const formatted = this.formatDateRange(range.from as number, range.to as number, this.language);
      const normalizedFormatted = {
        originalValue: { from: range.from as number, to: range.to as number },
        formattedValue: formatted.formattedValue,
        displayValue: formatted.displayValue,
      };
      return {
        value: { from: range.from as number, to: range.to as number },
        label: formatted.formattedValue, // Use formatted value as label
        displayValue: formatted.displayValue,
        formattedValue: normalizedFormatted,
        metadata: this.buildMetadata(descriptor),
      } as DateRangePropertyValue;
    });
  }

  private buildSelectValues(descriptor: NormalizedPropertyDescriptor): SelectPropertyValue[] {
    const { rawValue, lookups } = descriptor;
    if (rawValue === undefined || rawValue === null) return [];

    const list: any[] = Array.isArray(rawValue) ? rawValue : [rawValue];

    return list.map(value => {
      const option = lookups.selectOptionByValue[value];
      const formatted = this.formatSelect({ value, options: [option] }, this.language);
      const label = option?.label || value?.toString?.() || 'Unknown';
      return {
        value,
        label,
        displayValue: label,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };
    });
  }

  private buildRelationshipValues(
    descriptor: NormalizedPropertyDescriptor
  ): RelationshipPropertyValue[] {
    const { rawValue, lookups } = descriptor;
    if (!rawValue) return [];

    const relationshipType = lookups.relationshipTypeById[rawValue.relationshipTypeId];
    const thesaurus = lookups.thesaurusById[rawValue.thesaurusId];
    const isInherited = descriptor.isInherited === true;

    const ids: string[] = Array.isArray(rawValue.entityIds) ? rawValue.entityIds : [];

    return ids.map(entityId => {
      const formatted = this.formatRelationship(
        { value: { entityIds: [entityId] } },
        this.language
      );
      const label = `${relationshipType?.name || 'Relationship'} (${entityId})`;

      const baseValue = {
        value: [entityId], // RelationshipPropertyValue expects string[]
        label,
        displayValue: label,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };

      // Only add icon and url for non-inherited relationships
      if (!isInherited) {
        return {
          ...baseValue,
          icon: '', // Will be populated by the formatter
          url: `/entity/${entityId}`, // Will be populated by the formatter
        };
      }

      return baseValue;
    });
  }

  private buildGeolocationValues(
    descriptor: NormalizedPropertyDescriptor
  ): GeolocationPropertyValue[] {
    const { rawValue } = descriptor;
    if (!rawValue) return [];

    const list = Array.isArray(rawValue) ? rawValue : [rawValue];

    return list
      .filter(v => v && v.lat !== undefined && v.lon !== undefined)
      .map(v => {
        const formatted = this.formatGeolocation({ value: v }, this.language);
        const label = `${Number(v.lat).toFixed(4)}, ${Number(v.lon).toFixed(4)}`;
        return {
          value: { lat: v.lat, lon: v.lon },
          label,
          displayValue: label,
          formattedValue: formatted,
          metadata: this.buildMetadata(descriptor),
        };
      });
  }

  private buildFileValues(descriptor: NormalizedPropertyDescriptor): FilePropertyValue[] {
    const { rawValue, lookups } = descriptor;
    if (!rawValue) return [];

    const list = Array.isArray(rawValue) ? rawValue : [rawValue];

    return list.map(file => {
      const formatted = this.formatFile({ value: file }, this.language);
      const label = file.fileName || 'File';
      return {
        value: file,
        label,
        displayValue: label,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };
    });
  }

  private buildMarkdownValues(descriptor: NormalizedPropertyDescriptor): MarkdownPropertyValue[] {
    const { rawValue } = descriptor;
    if (!rawValue) return [];

    const list = Array.isArray(rawValue) ? rawValue : [rawValue];

    return list.map(text => {
      const formatted = this.formatMarkdown({ value: text }, this.language);
      return {
        value: text,
        label: this.truncateText(formatted.text, 50),
        displayValue: formatted.text,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };
    });
  }

  private buildInheritValues(descriptor: NormalizedPropertyDescriptor): InheritPropertyValue[] {
    const { rawValue } = descriptor;
    if (!rawValue) return [];

    const list = Array.isArray(rawValue) ? rawValue : [rawValue];

    return list.map(v => {
      const formatted = this.formatInherit({ value: v }, this.language);
      const label = `Inherited: ${formatted.formattedValue?.originalValue || v}`;
      return {
        value: v,
        label,
        displayValue: label,
        formattedValue: formatted,
        metadata: this.buildMetadata(descriptor),
      };
    });
  }

  private buildNestedValues(descriptor: NormalizedPropertyDescriptor): NestedPropertyValue[] {
    const { rawValue } = descriptor;
    if (!rawValue) return [];

    const list = Array.isArray(rawValue) ? rawValue : [rawValue];

    // Recursively normalize each nested child as its own value entry
    return list
      .map(nestedProp => this.buildPropertyValues({ ...descriptor, rawValue: nestedProp }))
      .flat() as unknown as NestedPropertyValue[];
  }

  private buildGenericValues(descriptor: NormalizedPropertyDescriptor): PropertyValue[] {
    const { rawValue } = descriptor;

    return [
      {
        value: rawValue,
        label: rawValue?.toString() || 'Unknown',
        displayValue: rawValue?.toString() || 'Unknown',
        formattedValue: rawValue,
        metadata: this.buildMetadata(descriptor),
      },
    ];
  }

  // Formatting methods (reuse existing logic)


  private buildMetadata(descriptor: NormalizedPropertyDescriptor): any {
    return {
      isInherited: descriptor.isInherited,
      inheritedFrom: descriptor.inheritedFrom,
      originalValue: descriptor.originalValue,
      timestamp: Date.now(),
      style: descriptor.style,
      icon: descriptor.icon,
      url: descriptor.url,
    };
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Additional helper methods from MetadataFormatter
  private formatFileLike(property: any, _language: string): any {
    if (!property || !property.value) return property;

    return {
      ...property,
      formattedValue: {
        fileName: property.value.fileName || 'Unknown',
        url: property.value.url || '',
        type: property.value.type || 'unknown',
        size: property.value.size || 0,
        style: property.value.style || 'default',
        label: property.value.label || '',
      },
      displayValue: property.value.label || property.value.fileName || 'Unknown',
      // Match sample structure
      values: [{ value: property.value, label: property.value.label || property.value.fileName || 'Unknown', displayValue: property.value.label || property.value.fileName || 'Unknown' }],
    };
  }

  private buildPropertyMetadata(property: any): any {
    const metadata: any = {
      fieldName: property.name,
      propertyType: property.type,
      isInherited: this.isInheritedProperty(property),
      isRequired: property.required || false,
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
      icon: property.icon,
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
