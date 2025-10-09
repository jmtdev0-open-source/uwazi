import {
  FormattedProperty,
  PropertyValue,
  PropertyTypeProcessor,
  ProcessingContext,
} from './types';

export class AdapterSelectProcessor implements PropertyTypeProcessor {
  readonly name = 'AdapterSelectProcessor';
  readonly priority = 15;
  readonly propertyTypes = ['select', 'multiselect'];

  async processBatch(
    properties: any[],
    context: ProcessingContext
  ): Promise<Map<string, FormattedProperty>> {
    const results = new Map<string, FormattedProperty>();

    const { selectFormatting, translations } = context;

    for (const property of properties) {
      try {
        const key = `${property._entityId}:${property._fieldName}`;
        const values = this.formatSelectProperty(property, selectFormatting, translations);

        results.set(key, { ...property, values });
      } catch (error) {
        console.error(`Error processing select property ${property._fieldName}:`, error);
      }
    }

    return results;
  }

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
        const translatedLabel =
          translations[option.translateContext || option.label] || option.label;

        return {
          value: selectedValue,
          label: showLabels ? translatedLabel : undefined,
          displayValue: showLabels ? translatedLabel : '',
          icon: showIcons ? option.icon : undefined,
          url: showUrls ? option.url : undefined,
        };
      });
    }

    return [
      {
        value: property.value,
        label: property.value?.toString() || '',
        displayValue: property.value?.toString() || '',
      },
    ];
  }
}
