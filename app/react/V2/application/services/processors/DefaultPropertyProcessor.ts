/**
 * Default Property Processor
 * Handles any property type with basic formatting
 */
import { BasePropertyProcessor } from './BasePropertyProcessor';

export class DefaultPropertyProcessor extends BasePropertyProcessor {
  readonly name = 'DefaultPropertyProcessor';
  readonly priority = 100; // Low priority - used as fallback
  readonly propertyTypes = ['any']; // Can handle any property type

  /**
   * Default implementation - returns raw values for any property type
   */
  protected formatProperty(property: any, context: any): any[] {
    return this.createRawValues(property);
  }
}
