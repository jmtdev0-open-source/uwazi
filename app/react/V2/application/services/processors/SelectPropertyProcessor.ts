import {
  FormattedProperty,
  PropertyValue,
  PropertyTypeProcessor,
  ProcessingContext,
} from './types';
import { ClientThesaurus, ClientThesaurusValue } from 'app/apiResponseTypes';

export class SelectPropertyProcessor implements PropertyTypeProcessor {
  readonly name = 'SelectPropertyProcessor';
  readonly propertyTypes = ['select', 'multiselect'];

  async processBatch(
    properties: any[],
    context: ProcessingContext
  ): Promise<Map<string, FormattedProperty>> {
    const results = new Map<string, FormattedProperty>();

    const { translations, thesauri } = context;
    const selectFormatting = {
      showLabels: context.showLabels,
      showIcons: context.showIcons,
      showUrls: context.showUrls,
      includeOptions: context.includeOptions,
    };

    properties.forEach(property => {
      try {
        const key = `${property._entityId}:${property._fieldName}`;
        const values = this.formatSelectProperty(property, selectFormatting, translations);

        const formattedProperty: FormattedProperty = { ...property, values };

        if (context.options.editionMode) {
          const selectedValues = Array.isArray(property.value) ? property.value : [property.value];
          const options = this.buildOptionsWithSelectionState(
            property,
            selectedValues,
            thesauri,
            translations,
            selectFormatting
          );
          formattedProperty.options = options;
        }

        results.set(key, formattedProperty);
      } catch (error) {
        console.error(`Error processing select property ${property._fieldName}:`, error);
      }
    });

    return results;
  }

  private formatSelectProperty(
    property: any,
    selectFormatting: any,
    translations: Record<string, any>
  ): PropertyValue[] {
    const { showLabels, showIcons, showUrls } = selectFormatting;

    if (property.value !== undefined && !property.options) {
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

  private findThesaurusByContentId(
    contentId: string,
    thesauri: ClientThesaurus[]
  ): ClientThesaurus | undefined {
    return thesauri.find(t => t._id === contentId);
  }

  private buildOptionsWithSelectionState(
    property: any,
    selectedValues: any[],
    thesauri: ClientThesaurus[],
    translations: Record<string, any>,
    selectFormatting: any
  ): PropertyValue[] {
    const thesaurus = this.findThesaurusByContentId(property.content, thesauri);

    if (!thesaurus || !thesaurus.values) {
      return [];
    }

    return thesaurus.values.map((option: ClientThesaurusValue) => {
      const isSelected = selectedValues.includes(option.id);
      const translatedLabel = translations[option.label] || option.label;

      return {
        value: option.id,
        label: selectFormatting.showLabels ? translatedLabel : undefined,
        displayValue: selectFormatting.showLabels ? translatedLabel : '',
        selected: isSelected,
      };
    });
  }
}
