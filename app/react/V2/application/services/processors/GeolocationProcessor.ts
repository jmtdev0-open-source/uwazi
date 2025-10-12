import { BasePropertyProcessor } from './BasePropertyProcessor';
import { PropertyValue, ProcessingContext } from './types';

export class GeolocationProcessor extends BasePropertyProcessor {
  readonly name = 'GeolocationProcessor';
  readonly priority = 25;
  readonly propertyTypes = ['geolocation'];

  protected formatProperty(property: any, context: ProcessingContext): PropertyValue[] {
    if (this.shouldSkipFormatting(context, 'geolocation')) {
      return this.createRawValues(property);
    }

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

  protected shouldSkipFormatting(context: ProcessingContext, formatKey?: string): boolean {
    if (formatKey === 'geolocation') {
      return context.options.geolocationOptions?.includeMapData === false;
    }
    return false;
  }

  private formatGeolocationProperty(property: any, context: ProcessingContext): PropertyValue[] {
    const geolocationFormatting = {
      precision: context.precision,
      includeMapData: context.includeMapData,
      combineGeolocation: context.combineGeolocation,
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

      let label: string;
      let formattedValue: any;

      if (false) {
        // Format option removed in simplified context
        const latDMS = this.toDMS(lat, 'lat');
        const lonDMS = this.toDMS(lon, 'lon');
        label = `${latDMS}, ${lonDMS}`;
        formattedValue = {
          lat: latDMS,
          lon: lonDMS,
          latDecimal: lat,
          lonDecimal: lon,
          visualization: geolocationFormatting.includeMapData
            ? geo.visualization || 'map'
            : undefined,
        };
      } else {
        const latFormatted = Number(lat).toFixed(geolocationFormatting.precision);
        const lonFormatted = Number(lon).toFixed(geolocationFormatting.precision);
        label = `${latFormatted}°N, ${lonFormatted}°E`;
        formattedValue = {
          lat: Number(latFormatted),
          lon: Number(lonFormatted),
          visualization: geolocationFormatting.includeMapData
            ? geo.visualization || 'map'
            : undefined,
        };
      }

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

  private toDMS(decimal: number, type: 'lat' | 'lon'): string {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;

    // avoid ternary operator
    let direction = '';
    if (type === 'lat') {
      direction = decimal >= 0 ? 'N' : 'S';
    } else {
      direction = decimal >= 0 ? 'E' : 'W';
    }

    return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
  }
}
