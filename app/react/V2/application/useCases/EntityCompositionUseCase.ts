/**
 * Entity Composition Use Case
 * Unified use case for entity composition with legacy pattern integration
 */
import { IncomingHttpHeaders } from 'http';
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import { MetadataFormatter } from '../services/MetadataFormatter';
import { atomStore, templatesAtom } from 'V2/atoms';
import {
  CompositionOptions,
  CompositionResult,
  BatchCompositionResult,
  CompositionError,
} from '../../domain/entities/types';
import { Entity, EntityFactory } from 'app/V2/domain';

export interface EntityCompositionUseCase {
  composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<CompositionResult>;

  composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult>;

  // composeEntitiesForListView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult>;

  // composeEntitiesForCardView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult>;

  // composeEntitiesForDetailView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult>;

  // composeEntitiesForFormView(
  //   entityIds: string[],
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult>;

  // composeEntitiesByTemplate(
  //   templateId: string,
  //   options: CompositionOptions,
  //   context: { userId?: string; userPermissions?: string[] }
  // ): Promise<BatchCompositionResult>;
}

export class EntityCompositionUseCaseImpl implements EntityCompositionUseCase {
  constructor(
    private readonly entityRepository: EntityRepository,
    private readonly metadataFormatter: MetadataFormatter
  ) {}

  async composeEntity(
    entityId: string,
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<CompositionResult> {
    try {
      const entity = await this.entityRepository.findBySharedId(entityId, options, context.headers);
      if (!entity) {
        return {
          entity: null,
          success: false,
          error: 'Entity not found',
        };
      }

      const composedEntity = await this.composeEntityWithLegacyFormatting(entity, options, context);

      return {
        entity: composedEntity,
        success: true,
      };
    } catch (error) {
      return {
        entity: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async composeEntities(
    entityIds: string[],
    options: CompositionOptions,
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    const results: Entity[] = [];
    const errors: CompositionError[] = [];

    try {
      const entities = await this.entityRepository.findByIds(entityIds, options);

      await Promise.all(
        entities.map(async entity => {
          try {
            const composedEntity = await this.composeEntityWithLegacyFormatting(
              entity,
              options,
              context
            );
            results.push(composedEntity);
          } catch (error) {
            errors.push({
              entityId: entity._id,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date(),
            });
          }
        })
      );

      return {
        entities: results,
        errors,
        success: errors.length === 0,
        totalProcessed: entityIds.length,
        successCount: results.length,
        errorCount: errors.length,
      };
    } catch (error) {
      return {
        entities: [],
        errors: [
          {
            entityId: 'batch',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          },
        ],
        success: false,
        totalProcessed: entityIds.length,
        successCount: 0,
        errorCount: entityIds.length,
      };
    }
  }

  async composeEntitiesForListView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: false,
        includeMetadata: false,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        includePermissions: true,
        onlyForCards: true,
      },
      context
    );
  }

  async composeEntitiesForCardView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        includePermissions: true,
        onlyForCards: true,
      },
      context
    );
  }

  async composeEntitiesForDetailView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
      },
      context
    );
  }

  async composeEntitiesForFormView(
    entityIds: string[],
    context: { userId?: string; userPermissions?: string[] }
  ): Promise<BatchCompositionResult> {
    return this.composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
        excludePreview: true,
      },
      context
    );
  }

  // async getFormattedMetadata(entityId: string, propertyName: string, dateFormat?: string): Promise<any> {
  //   const entity = await this.entityRepository.findBySharedId(entityId);
  //   if (!entity) return null;

  //   const property = entity.metadata[propertyName];
  //   if (!property) return null;

  //   return this.legacyMetadataFormatter.formatProperty(property, entity.language, dateFormat);
  // }

  // async getFormattedRelationships(entityId: string): Promise<any> {
  //   const entity = await this.entityRepository.findBySharedId(entityId);
  //   if (!entity) return null;

  //   return entity.relationships;
  // }

  // async getFormattedFiles(entityId: string): Promise<any> {
  //   const entity = await this.entityRepository.findBySharedId(entityId);
  //   if (!entity) return null;

  //   return entity.files;
  // }

  // async getFormattedNavigation(entityId: string): Promise<any> {
  //   const entity = await this.entityRepository.findBySharedId(entityId);
  //   if (!entity) return null;

  //   return entity.navigation;
  // }

  private async composeEntityWithLegacyFormatting(
    entity: any,
    options: CompositionOptions,
    _context: { userId?: string; userPermissions?: string[]; headers?: IncomingHttpHeaders }
  ): Promise<Entity> {
    // Only process metadata if requested
    const formattedMetadata: Record<string, any> = {};

    if (options.includeMetadata || options.includeProperties) {
      // Determine which fields to process based on options
      let fieldsToProcess = this.getFieldsToProcess(entity.metadata, options);
      // Only process the requested fields
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

  /**
   * Determine which fields to process based on composition options
  //  */
  private getFieldsToProcess(
    metadata: Record<string, any>,
    options: CompositionOptions
  ): Record<string, any> {
    const fieldsToProcess: Record<string, any> = {};

    if (!options.includeMetadata && !options.includeProperties) {
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

    if (options.fieldNames && options.fieldNames.length > 0) {
      options.fieldNames.forEach(fieldName => {
        if (metadata[fieldName]) {
          fieldsToProcess[fieldName] = metadata[fieldName];
        }
      });
      return fieldsToProcess;
    }

    // Priority 4: If fieldTypes is specified, filter by type
    if (options.fieldTypes && options.fieldTypes.length > 0) {
      Object.entries(metadata).forEach(([key, property]) => {
        // Check if the field name matches any of the requested types
        // or if the field name contains the type (e.g., 'geolocation_geolocation' contains 'geolocation')
        const fieldName = key.toLowerCase();
        const matchesType = options.fieldTypes!.some(type => {
          const typeLower = type.toLowerCase();
          return (
            fieldName === typeLower ||
            fieldName.includes(typeLower) ||
            fieldName.endsWith(`_${typeLower}`)
          );
        });

        if (matchesType) {
          fieldsToProcess[key] = property;
        }
      });
      return fieldsToProcess;
    }

    // Priority 5: If onlyForCards is true, only process fields marked for card display
    if (options.onlyForCards) {
      Object.entries(metadata).forEach(([key, property]) => {
        if (property.showInCard === true) {
          fieldsToProcess[key] = property;
        }
      });
      return fieldsToProcess;
    }

    // Priority 6: If specific field types are requested, filter by type
    if (options.includeProperties && !options.includeMetadata) {
      // Only process properties that are not metadata-specific
      Object.entries(metadata).forEach(([key, property]) => {
        if (property.type && !this.isMetadataSpecificType(property.type)) {
          fieldsToProcess[key] = property;
        }
      });
      return fieldsToProcess;
    }

    // Priority 7: If metadata is requested, include all fields
    if (options.includeMetadata) {
      return metadata;
    }

    // Default: return all fields if no specific filtering
    return metadata;
  }

  /**
   * Check if a property type is metadata-specific
   */
  private isMetadataSpecificType(type: string): boolean {
    const metadataTypes = [
      'date',
      'daterange',
      'multidate',
      'multidaterange',
      'select',
      'multiselect',
      'geolocation',
      'image',
      'media',
      'markdown',
      'relationship',
      'inherit',
      'newRelationshipWithInherit',
      'nested',
    ];
    return metadataTypes.includes(type);
  }

  /**
   * Apply field exclusions to the processed fields
   */
  // private applyFieldExclusions(
  //   fieldsToProcess: Record<string, any>,
  //   options: CompositionOptions
  // ): Record<string, any> {
  //   if (!options.excludeFields || options.excludeFields.length === 0) {
  //     return fieldsToProcess;
  //   }

  //   const filteredFields: Record<string, any> = {};
  //   Object.entries(fieldsToProcess).forEach(([key, property]) => {
  //     if (!options.excludeFields!.includes(key)) {
  //       filteredFields[key] = property;
  //     }
  //   });

  //   return filteredFields;
  // }

  /**
   * Process relationships based on options
   */
  // private processRelationships(relationships: any, options: CompositionOptions): any {
  //   if (!options.includeRelationships) {
  //     return {
  //       hubs: [],
  //       connections: [],
  //       summary: { totalConnections: 0, hubCount: 0 },
  //       navigation: {
  //         availableTabs: {},
  //         defaultTab: 'info',
  //         hasPageView: false,
  //         hasRelationships: false,
  //         hasNewRelationships: false,
  //       },
  //     };
  //   }

  //   if (Array.isArray(relationships)) {
  //     return {
  //           hubs: [],
  //       connections: relationships,
  //       summary: { totalConnections: relationships.length, hubCount: 0 },
  //           navigation: {
  //             availableTabs: {},
  //             defaultTab: 'info',
  //             hasPageView: false,
  //         hasRelationships: relationships.length > 0,
  //             hasNewRelationships: false,
  //           },
  //     };
  //         }

  //   return (
  //     relationships || {
  //           hubs: [],
  //           connections: [],
  //           summary: { totalConnections: 0, hubCount: 0 },
  //           navigation: {
  //             availableTabs: {},
  //             defaultTab: 'info',
  //             hasPageView: false,
  //             hasRelationships: false,
  //             hasNewRelationships: false,
  //           },
  //     }
  //   );
  // }

  /**
   * Process files based on options
   */
  // private processFiles(files: any, options: CompositionOptions): any {
  //   if (!options.includeFiles) {
  //     return { documents: [], attachments: [], processed: false };
  //   }

  //   return files || { documents: [], attachments: [], processed: false };
  // }

  /**
   * Process navigation based on options
   */
  // private processNavigation(navigation: any, options: CompositionOptions): any {
  //   if (!options.includeNavigation) {
  //     return {
  //       availableTabs: {},
  //       defaultTab: 'info',
  //       hasPageView: false,
  //       hasRelationships: false,
  //       hasNewRelationships: false,
  //       panelOpen: false,
  //       copyFrom: false,
  //       copyFromProps: [],
  //     };
  //   }

  //   return (
  //     navigation || {
  //       availableTabs: {},
  //       defaultTab: 'info',
  //       hasPageView: false,
  //       hasRelationships: false,
  //       hasNewRelationships: false,
  //       panelOpen: false,
  //       copyFrom: false,
  //       copyFromProps: [],
  //     }
  //   );
  // }

  /**
   * Build property metadata information
   */
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

  /**
   * Check if a property is inherited
   */
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

  /**
   * Compose template from template ID
   */
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
