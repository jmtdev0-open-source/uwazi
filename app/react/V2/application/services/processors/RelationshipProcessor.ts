/**
 * Relationship Property Processor
 * Specialized processor for handling relationship properties with standardized structure
 */
import { BasePropertyProcessor } from './BasePropertyProcessor';
import { FormattedProperty, PropertyValue, ProcessingContext } from './types';

export class RelationshipProcessor extends BasePropertyProcessor {
  readonly name = 'RelationshipProcessor';
  readonly priority = 20;
  readonly propertyTypes = ['relationship'];

  protected formatProperty(property: any, context: ProcessingContext): PropertyValue[] {
    if (this.shouldSkipFormatting(context, 'relationship')) {
      return this.createRawValues(property);
    }

    return this.formatRelationshipProperty(property, context);
  }

  /**
   * Create raw values for relationship properties
   */
  protected createRawValues(property: any): PropertyValue[] {
    const values = Array.isArray(property.value) ? property.value : [property.value];

    return values.map((rel: any): PropertyValue => {
      if (!rel) {
        return {
          value: rel,
          label: '',
          displayValue: '',
        };
      }

      return {
        value: rel.value || rel,
        label: rel.label || rel.displayValue || rel.toString(),
        displayValue: rel.displayValue || rel.label || rel.toString(),
      };
    });
  }

  /**
   * Check if relationship formatting should be skipped
   */
  protected shouldSkipFormatting(context: ProcessingContext, formatKey?: string): boolean {
    if (formatKey === 'relationship') {
      return context.options.relationshipOptions?.includeEntityData === false;
    }
    return false;
  }

  /**
   * Get custom relationship format from options
   */
  protected getCustomFormat(
    context: ProcessingContext,
    formatKey: string,
    defaultFormat: string
  ): string {
    if (formatKey === 'relationship') {
      // Relationship doesn't have a custom format option, return default
      return defaultFormat;
    }
    return defaultFormat;
  }

  private formatRelationshipProperty(property: any, context: ProcessingContext): PropertyValue[] {
    const { relationshipFormatting } = context;
    const { nestedLevel, includeEntityData, includeTemplates, maxRelationships } =
      relationshipFormatting;

    // Handle relationship values array
    const values = Array.isArray(property.value) ? property.value : [property.value];
    const isInherited = property.inherited === true;

    // Apply max relationships limit if specified
    const limitedValues = maxRelationships ? values.slice(0, maxRelationships) : values;

    return limitedValues.map((rel: any): PropertyValue => {
      const baseValue = {
        value: rel.value || rel,
        label: rel.label || rel.displayValue || rel.toString(),
        displayValue: rel.displayValue || rel.label || rel.toString(),
      };

      // Add relationship-specific data based on options
      const relationshipValue: PropertyValue = { ...baseValue };

      // Add icon and url for non-inherited relationships
      if (!isInherited) {
        relationshipValue.icon = rel.icon || '';
        relationshipValue.url = rel.url || '';
      }

      // Add relationship data if requested
      if (includeEntityData && rel.relationshipData) {
        relationshipValue.relationshipData = {
          entityId: rel.relationshipData.entityId,
          entityTitle: rel.relationshipData.entityTitle,
          relationshipType: rel.relationshipData.relationshipType,
          template: includeTemplates ? rel.relationshipData.template : undefined,
        };
      }

      // Add nested level information
      if (nestedLevel > 1) {
        relationshipValue.nestedLevel = nestedLevel;
      }

      return relationshipValue;
    });
  }
}
