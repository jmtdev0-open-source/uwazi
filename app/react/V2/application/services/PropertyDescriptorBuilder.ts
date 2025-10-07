/**
 * Property Descriptor Builder
 * Creates normalized property descriptors with precomputed lookups
 */
import { NormalizedPropertyDescriptor } from '../../domain/entities/PropertyValue';
import { PropertyValueBuilder } from './PropertyValueBuilder';

export interface PropertyLookups {
  selectOptionByValue: Record<string, { label: string; icon?: string; url?: string; extra?: any }>;
  thesaurusById: Record<string, { id: string; name: string; valuesByKey: Record<string, any> }>;
  relationshipTypeById: Record<
    string,
    { id: string; name: string; leftTemplates: string[]; rightTemplates: string[] }
  >;
  templateById: Record<string, { id: string; name: string; propertiesByName: Record<string, any> }>;
  mediaConfig: { defaultStyle: string; mimeGroups: Record<string, string[]> };
  dateConfig: { defaultFormat: string; locale: string };
}

export class PropertyDescriptorBuilder {
  constructor(
    private readonly lookups: PropertyLookups,
    private readonly language: string = 'en'
  ) {}

  buildDescriptor(
    property: any,
    fieldName: string,
    dateFormat?: string
  ): NormalizedPropertyDescriptor {
    const valueBuilder = new PropertyValueBuilder(
      dateFormat || this.lookups.dateConfig.defaultFormat,
      this.language
    );

    // Build normalized values using the unified structure
    const values = valueBuilder.buildPropertyValues({
      id: property._id || fieldName,
      name: property.name || fieldName,
      label: property.label || property.name || fieldName,
      type: property.type,
      language: this.language,
      required: property.required || false,
      multiple: property.multiple || false,
      showInCard: property.showInCard || false,
      noLabel: property.noLabel || false,
      fullWidth: property.fullWidth || false,
      obsolete: property.obsolete || false,
      isInherited: this.isInheritedProperty(property),
      inheritedType: property.inheritedType,
      inheritedFrom: property.inheritedFrom,
      originalValue: property.originalValue,
      translateContext: property.translateContext,
      indexInTemplate: property.indexInTemplate,
      parent: property.parent,
      style: property.style,
      icon: property.icon,
      url: property.url,
      rawValue: property.value,
      path: fieldName,
      values: [],
      lookups: this.lookups,
    });

    return {
      id: property._id || fieldName,
      name: property.name || fieldName,
      label: property.label || property.name || fieldName,
      type: property.type,
      language: this.language,
      required: property.required || false,
      multiple: property.multiple || false,
      showInCard: property.showInCard || false,
      noLabel: property.noLabel || false,
      fullWidth: property.fullWidth || false,
      obsolete: property.obsolete || false,
      isInherited: this.isInheritedProperty(property),
      inheritedType: property.inheritedType,
      inheritedFrom: property.inheritedFrom,
      originalValue: property.originalValue,
      translateContext: property.translateContext,
      indexInTemplate: property.indexInTemplate,
      parent: property.parent,
      style: property.style,
      icon: property.icon,
      url: property.url,
      rawValue: property.value,
      path: fieldName,
      values,
      lookups: this.lookups,
    };
  }

  private isInheritedProperty(property: any): boolean {
    return !!(
      property.inherited ||
      property.inheritedType ||
      property.inheritedValue ||
      property.originalValue
    );
  }
}

/**
 * Lookup Builder
 * Precomputes all necessary lookups from atoms/repositories
 */
export class LookupBuilder {
  static async buildLookups(
    templates: any[],
    thesauri: any[],
    relationshipTypes: any[],
    dateFormat: string = 'YYYY-MM-DD',
    language: string = 'en'
  ): Promise<PropertyLookups> {
    return {
      selectOptionByValue: this.buildSelectOptions(templates),
      thesaurusById: this.buildThesaurusLookup(thesauri),
      relationshipTypeById: this.buildRelationshipTypeLookup(relationshipTypes),
      templateById: this.buildTemplateLookup(templates),
      mediaConfig: {
        defaultStyle: 'default',
        mimeGroups: {
          image: ['image/jpeg', 'image/png', 'image/gif'],
          video: ['video/mp4', 'video/avi', 'video/mov'],
          audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
          document: ['application/pdf', 'text/plain', 'application/msword'],
        },
      },
      dateConfig: {
        defaultFormat: dateFormat,
        locale: language,
      },
    };
  }

  private static buildSelectOptions(templates: any[]): Record<string, any> {
    const options: Record<string, any> = {};

    templates.forEach(template => {
      if (template.properties) {
        template.properties.forEach((prop: any) => {
          if (prop.type === 'select' && prop.options) {
            prop.options.forEach((option: any) => {
              options[option.value] = {
                label: option.label,
                icon: option.icon,
                url: option.url,
                extra: option.extra,
              };
            });
          }
        });
      }
    });

    return options;
  }

  private static buildThesaurusLookup(thesauri: any[]): Record<string, any> {
    const lookup: Record<string, any> = {};

    thesauri.forEach(thesaurus => {
      lookup[thesaurus._id] = {
        id: thesaurus._id,
        name: thesaurus.name,
        valuesByKey: thesaurus.values || {},
      };
    });

    return lookup;
  }

  private static buildRelationshipTypeLookup(relationshipTypes: any[]): Record<string, any> {
    const lookup: Record<string, any> = {};

    relationshipTypes.forEach(relType => {
      lookup[relType._id] = {
        id: relType._id,
        name: relType.name,
        leftTemplates: relType.leftTemplates || [],
        rightTemplates: relType.rightTemplates || [],
      };
    });

    return lookup;
  }

  private static buildTemplateLookup(templates: any[]): Record<string, any> {
    const lookup: Record<string, any> = {};

    templates.forEach(template => {
      const propertiesByName: Record<string, any> = {};
      if (template.properties) {
        template.properties.forEach((prop: any) => {
          propertiesByName[prop.name] = prop;
        });
      }

      lookup[template._id] = {
        id: template._id,
        name: template.name,
        propertiesByName,
      };
    });

    return lookup;
  }
}
