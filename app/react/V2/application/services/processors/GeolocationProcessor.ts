/**
 * Geolocation Property Processor
 * Specialized processor for handling geolocation properties with standardized structure
 */
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

  /**
   * Create raw values for geolocation properties
   */
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

      // Handle different input structures
      let lat: number;
      let lon: number;

      if (geo.value && (geo.value.latitude !== undefined || geo.value.longitude !== undefined)) {
        // Handle case where geo has a value property with coordinates
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

  /**
   * Check if geolocation formatting should be skipped
   */
  protected shouldSkipFormatting(context: ProcessingContext, formatKey?: string): boolean {
    if (formatKey === 'geolocation') {
      return context.options.geolocationOptions?.includeMapData === false;
    }
    return false;
  }

  private formatGeolocationProperty(property: any, context: ProcessingContext): PropertyValue[] {
    const geolocationFormatting = context.geolocationFormatting;
    const values = Array.isArray(property.value) ? property.value : [property.value];

    const formattedValues = values.map((geo: any) => {
      if (!geo) {
        return {
          value: geo,
          label: '',
          displayValue: '',
        };
      }

      // Handle different input structures
      let lat: number;
      let lon: number;

      if (geo.value && (geo.value.latitude !== undefined || geo.value.longitude !== undefined)) {
        // Handle case where geo has a value property with coordinates
        lat = geo.value.latitude || geo.value.lat;
        lon = geo.value.longitude || geo.value.lon;
      } else if (geo.latitude !== undefined || geo.longitude !== undefined) {
        // Handle case where geo is the coordinate object directly
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

      if (geolocationFormatting.format === 'dms') {
        // Convert to degrees, minutes, seconds format
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
        // Decimal format
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

    // Combine geolocations if requested
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

    const direction = type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : decimal >= 0 ? 'E' : 'W';

    return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
  }
}
