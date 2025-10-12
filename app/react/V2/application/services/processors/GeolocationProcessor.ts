import { BasePropertyProcessor } from './BasePropertyProcessor';
import { PropertyValue, ProcessingContext } from './types';

export class GeolocationProcessor extends BasePropertyProcessor {
  readonly name = 'GeolocationProcessor';
  readonly propertyTypes = ['geolocation'];

  protected formatProperty(property: any, context: ProcessingContext): PropertyValue[] {
    return this.formatGeolocationProperty(property, context);
  }

  protected createRawValues(property: any): PropertyValue[] {
    const values = Array.isArray(property.value) ? property.value : [property.value];
    return values.map((geo: any) => {
      if (!geo) {
        return {
          value: geo,
          label: '',
          displayValue: '',
        };
      }

      let lat: number;
      let lon: number;

      if (geo.value && (geo.value.latitude !== undefined || geo.value.longitude !== undefined)) {
        lat = geo.value.latitude || geo.value.lat;
        lon = geo.value.longitude || geo.value.lon;
      } else if (geo.latitude !== undefined || geo.longitude !== undefined) {
        // Handle case where geo is the coordinate object directly
        lat = geo.latitude || geo.lat;
        lon = geo.longitude || geo.lon;
      } else {
        // Fallback - return the original geo object
        return {
          value: geo,
          label: geo.toString() || '',
          displayValue: geo.toString() || '',
        };
      }

      const label = lat && lon ? `${lat}, ${lon}` : 'Invalid coordinates';
      return {
        value: { latitude: lat, longitude: lon },
        label,
        displayValue: label,
      };
    });
  }


  private formatGeolocationProperty(property: any, context: ProcessingContext): PropertyValue[] {
    const geolocationFormatting = {
      precision: context.precision,
      includeMapData: context.includeMapData,
      combineGeolocation: context.options.editionMode ? false : context.combineGeolocation,
    };
    const values = Array.isArray(property.value) ? property.value : [property.value];

    const formattedValues = values.map((geo: any) => {
      if (!geo) {
        return {
          value: geo,
          label: '',
          displayValue: '',
        };
      }

      let lat: number;
      let lon: number;

      if (geo.value && (geo.value.latitude !== undefined || geo.value.longitude !== undefined)) {
        lat = geo.value.latitude || geo.value.lat;
        lon = geo.value.longitude || geo.value.lon;
      } else if (geo.latitude !== undefined || geo.longitude !== undefined) {
        lat = geo.latitude || geo.lat;
        lon = geo.longitude || geo.lon;
      } else {
        return {
          value: geo,
          label: 'Invalid coordinates',
          displayValue: 'Invalid coordinates',
          error: 'Invalid coordinates',
        };
      }

      if (!lat || !lon) {
        return {
          value: geo,
          label: 'Invalid coordinates',
          displayValue: 'Invalid coordinates',
          error: 'Invalid coordinates',
        };
      }

      const latFormatted = Number(lat).toFixed(geolocationFormatting.precision);
      const lonFormatted = Number(lon).toFixed(geolocationFormatting.precision);
      const label = `${latFormatted}°N, ${lonFormatted}°E`;
      const formattedValue = {
        lat: Number(latFormatted),
        lon: Number(lonFormatted),
        visualization: geolocationFormatting.includeMapData
          ? geo.visualization || 'map'
          : undefined,
      };

      return {
        value: { latitude: lat, longitude: lon },
        label,
        displayValue: label,
        formattedValue,
      };
    });

    const finalValues =
      geolocationFormatting.combineGeolocation && formattedValues.length > 1
        ? [
          {
            value: formattedValues.map((v: any) => v.value),
            label: `Multiple locations (${formattedValues.length})`,
            displayValue: `Multiple locations (${formattedValues.length})`,
            formattedValue: formattedValues,
          },
        ]
        : formattedValues;

    return finalValues;
  }

  private buildFlattenedCoordinates(property: any, context: ProcessingContext): PropertyValue[] {
    const values = Array.isArray(property.value) ? property.value : [property.value];

    return values.map((geo: any, index: number) => {
      if (!geo) {
        return {
          value: null,
          label: '',
          displayValue: '',
          selected: false,
          id: `coord_${index}`,
          lat: null,
          lon: null
        };
      }

      const lat = geo.value?.latitude || geo.latitude || geo.lat;
      const lon = geo.value?.longitude || geo.longitude || geo.lon;

      return {
        value: { latitude: lat, longitude: lon },
        label: lat && lon ? `${lat}, ${lon}` : 'Invalid coordinates',
        displayValue: lat && lon ? `${lat}, ${lon}` : 'Invalid coordinates',
        selected: true, // All coordinates are selected in edition mode
        id: `coord_${index}`,
        lat: lat,
        lon: lon,
        precision: context.precision
      };
    });
  }

}
