import moment from 'moment';
import { FormattedProperty, PropertyValue, PropertyTypeProcessor } from './types';

export class AdapterDateProcessor implements PropertyTypeProcessor {
  readonly name = 'AdapterDateProcessor';
  readonly priority = 10;
  readonly propertyTypes = ['date', 'multidate', 'daterange', 'multidaterange'];

  async processBatch(properties: any[], sharedData: any): Promise<Map<string, FormattedProperty>> {
    const results = new Map<string, FormattedProperty>();

    const { dateFormatting } = sharedData;

    for (const property of properties) {
      try {
        const key = `${property._entityId}:${property.name}`;
        const values = this.formatDateProperty(property, dateFormatting);
        results.set(key, { ...property, values });
      } catch (error) {
        console.error(`Error processing date property ${property._fieldName}:`, error);
      }
    }

    return results;
  }

  private formatDateProperty(property: any, dateFormatting: any): PropertyValue[] {
    if (property.type === 'date' || property.type === 'multidate') {
      return this.formatSingleDate(property, dateFormatting);
    }

    if (property.type === 'daterange' || property.type === 'multidaterange') {
      return this.formatDateRange(property, dateFormatting);
    }

    return [
      {
        value: property.value,
        label: property.value?.toString() || '',
        displayValue: property.value?.toString() || '',
      },
    ];
  }

  private formatSingleDate(property: any, dateFormatting: any): PropertyValue[] {
    const { format, timezone, includeTime, relativeTime, locale } = dateFormatting;
    const values = Array.isArray(property.value) ? property.value : [property.value];

    return values.map((propertyValue: PropertyValue) => {
      if (!propertyValue) {
        return {
          value: propertyValue,
          label: '',
          displayValue: '',
          formattedValue: '',
          localizedValue: '',
        };
      }

      let momentInstance = moment.utc(propertyValue.value, 'X');
      momentInstance = momentInstance.locale(locale);

      if (timezone) {
        momentInstance = momentInstance.tz(timezone);
      }

      const rawValue = propertyValue.value;

      let formattedValue = '';
      if (relativeTime) {
        formattedValue = momentInstance.fromNow();
      } else {
        const baseFormat = includeTime ? `${format} HH:mm:ss` : format;
        formattedValue = momentInstance.format(baseFormat);
      }

      const localizedValue = momentInstance.format('ll' + (includeTime ? ' HH:mm' : ''));

      return {
        ...propertyValue,
        value: rawValue,
        formattedValue,
        localizedValue,
        displayValue: localizedValue,
        label: formattedValue,
      };
    });
  }

  private formatDateRange(property: any, dateFormatting: any): PropertyValue[] {
    const { format, timezone, includeTime, relativeTime, locale } = dateFormatting;
    const ranges = Array.isArray(property.value) ? property.value : [property.value];

    return ranges.map((propertyValue: PropertyValue) => {
      const { from, to } = propertyValue.value;

      if (!from && !to) {
        return {
          ...propertyValue,
          formattedValue: '',
          localizedValue: '',
          displayValue: '',
        };
      }

      if (!from) {
        const toFormatted = this.formatSingleDate({ value: [{ value: to }] }, dateFormatting);
        return {
          ...propertyValue,
          formattedValue: toFormatted[0]?.formattedValue || '',
          localizedValue: toFormatted[0]?.localizedValue || '',
          displayValue: toFormatted[0]?.displayValue || '',
        };
      }

      if (!to) {
        const fromFormatted = this.formatSingleDate({ value: [{ value: from }] }, dateFormatting);
        return {
          ...propertyValue,
          formattedValue: fromFormatted[0]?.formattedValue || '',
          localizedValue: fromFormatted[0]?.localizedValue || '',
          displayValue: fromFormatted[0]?.displayValue || '',
        };
      }

      const fromFormatted = this.formatSingleDate({ value: [{ value: from }] }, dateFormatting);
      const toFormatted = this.formatSingleDate({ value: [{ value: to }] }, dateFormatting);

      return {
        ...propertyValue,
        formattedValue: `${fromFormatted[0]?.formattedValue || ''} ~ ${toFormatted[0]?.formattedValue || ''}`, // Version 2: Formatted range
        localizedValue: `${fromFormatted[0]?.localizedValue || ''} ~ ${toFormatted[0]?.localizedValue || ''}`, // Version 3: Localized range
        displayValue: `${fromFormatted[0]?.localizedValue || ''} ~ ${toFormatted[0]?.localizedValue || ''}`, // Default display (localized)
      };
    });
  }
}
