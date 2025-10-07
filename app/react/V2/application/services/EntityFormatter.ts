import { Entity, EntityFactory } from "app/V2/domain";
import { CompositionOptions } from "../types";
import { IncomingHttpHeaders } from "http";
import { atomStore, templatesAtom } from "app/V2/atoms";
import { MetadataFormatter } from "./MetadataFormatter";

export interface EntityFormatter {
    composeEntityWithFormatting(
        entity: any,
        options: CompositionOptions,
        _context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
      ): Promise<Entity>;
}

export class EntityFormatterImpl implements EntityFormatter {
    private readonly metadataFormatter: MetadataFormatter;

    constructor(metadataFormatter: MetadataFormatter) {
        this.metadataFormatter = metadataFormatter;
    }

    async composeEntityWithFormatting(
    entity: any,
    options: CompositionOptions,
    _context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<Entity> {
    const formattedMetadata: Record<string, any> = {};

    if (options.includeMetadata) {
      let fieldsToProcess = this.getFieldsToProcess(entity.metadata, options);
      Object.entries(fieldsToProcess).forEach(([key, property]) => {
        const formattedProperty = this.metadataFormatter.formatProperty(
          property,
          entity.language,
          options.dateFormat,
          options.includePropertyMetadata
        );

        // Build the final formatted property
        const finalProperty: any = {
          ...formattedProperty,
          // Use the displayValue from the formatter if available, otherwise fallback
          displayValue:
            formattedProperty.displayValue ||
            (Array.isArray(formattedProperty.formattedValue)
              ? formattedProperty.formattedValue.join(', ')
              : formattedProperty.formattedValue) ||
            formattedProperty.value ||
            formattedProperty.label ||
            formattedProperty.name ||
            'Unknown',
          // Preserve the original value for editing
          originalValue: formattedProperty.originalValue || property.value,
          // Preserve the formatted value for display
          formattedValue: formattedProperty.formattedValue || formattedProperty.value,
        };

        // Include property metadata if requested
        if (options.includePropertyMetadata) {
          // Debug: Log the raw property structure for relationship fields
          if (key === 'relationship') {
            console.log(
              '🔍 Raw property structure for relationship:',
              JSON.stringify(property, null, 2)
            );
          }
          finalProperty.propertyMetadata = this.buildPropertyMetadata(property, key);
        }

        formattedMetadata[key] = finalProperty;
      });
    }

    // Compose template if requested
    let composedTemplate;
    if (options.includeTemplate && entity.template) {
      composedTemplate = await this.composeTemplate(entity.template);
    }

    // Create composed entity using the domain class factory method
    const composedEntity = EntityFactory.fromRawEntity(entity, {
      includeTemplate: options.includeTemplate,
      includePermissions: options.includePermissions,
      includeMetadata: options.includeMetadata,
      includeRelationships: options.includeRelationships,
      includeFiles: options.includeFiles,
      includeNavigation: options.includeNavigation,
      // Pass the filtered metadata to the factory method
      filteredMetadata: formattedMetadata,
      // Pass the composed template
      composedTemplate: composedTemplate,
    });

    return composedEntity;
  }


  private getFieldsToProcess(
    metadata: Record<string, any>,
    options: CompositionOptions
  ): Record<string, any> {
    const fieldsToProcess: Record<string, any> = {};

    if (!options.includeMetadata) {
      return fieldsToProcess;
    }

    if (options.onlyForCards) {
      Object.entries(metadata).forEach(([key, property]) => {
        if (property.showInCard === true) {
          fieldsToProcess[key] = property;
        }
      });
      return fieldsToProcess;
    }

    if (options.includeFields && options.includeFields.length > 0) {
      options.includeFields.forEach(fieldName => {
        if (metadata[fieldName]) {
          fieldsToProcess[fieldName] = metadata[fieldName];
        }
      });
      return fieldsToProcess;
    }

    return metadata;
  }

  private buildPropertyMetadata(property: any, fieldName: string): any {
    const metadata: any = {
      fieldName: fieldName,
      propertyType: property.type,
      isInherited: this.isInheritedProperty(property),
      isRequired: property.required || false,
      isMultiple: property.multiple || false,
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
    if (metadata.isInherited) {
      metadata.inheritanceDetails = {
        inheritedType: property.inheritedType,
        inheritedValue: property.inheritedValue,
        originalValue: property.originalValue,
        inheritedFrom: property.inheritedFrom || 'Unknown',
      };

      // For relationship properties, add detailed inherited property metadata
      if (metadata.propertyType === 'relationship' && property.options) {
        metadata.inheritedPropertyMetadata = property.options
          .filter((opt: any) => opt.inheritedValue && opt.inheritedValue.length > 0)
          .map((opt: any) => ({
            optionValue: opt.value,
            optionLabel: opt.label,
            inheritedType: opt.inheritedType,
            inheritedValues: opt.inheritedValue.map((iv: any) => ({
              value: iv.value,
              label: iv.label,
            })),
          }));
      }
    }

    // Add relationship details if it's a relationship property
    if (metadata.propertyType === 'relationship') {
      metadata.relationshipDetails = {
        thesaurus: property.thesaurus || [],
        entityType: property.entityType,
        relationshipType: property.relationshipType,
        hub: property.hub,
        hasNewRelationships: property.hasNewRelationships || false,
      };
    }

    // Add file details if it's a file property
    if (metadata.propertyType === 'image' || metadata.propertyType === 'media') {
      metadata.fileDetails = {
        fileName: property.fileName,
        timeLinks: property.timeLinks,
        fileType: property.fileType,
        mimeType: property.mimeType,
        size: property.size,
      };
    }

    return metadata;
  }

  private isInheritedProperty(property: any): boolean {
    // Check direct inheritance flags
    if (
      property.inherited ||
      property.inheritedType ||
      property.inheritedValue ||
      property.originalValue
    ) {
      return true;
    }

    // Check if any options have inherited values (for relationship properties)
    if (property.options && Array.isArray(property.options)) {
      return property.options.some(
        (opt: any) => opt.inheritedValue && opt.inheritedValue.length > 0
      );
    }

    return false;
  }

  private async composeTemplate(templateId: string): Promise<any> {
    try {
      // Get templates from atom store
      const templates = atomStore.get(templatesAtom);

      // Find the template by ID
      const template = templates.find((t: any) => t._id === templateId);

      return {
        id: templateId,
        name: template?.name || templateId, // Use actual template name from atom store
        properties: [],
      };
    } catch (error) {
      console.warn(`Failed to compose template ${templateId}:`, error);
      return {
        id: templateId,
        name: templateId, // Fallback to ID if composition fails
        properties: [],
      };
    }
  }

}