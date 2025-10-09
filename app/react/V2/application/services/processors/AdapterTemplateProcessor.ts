import { Template } from 'app/apiResponseTypes';
import { ClientTranslationContextSchema } from 'app/istore';
import { ComposedTemplate } from 'app/V2/domain/entities/types';
import { PropertySchema } from 'shared/types/commonTypes';
import { ProcessingContext } from './types';

export class AdapterTemplateProcessor {
    private readonly context: ProcessingContext;

    constructor(context: ProcessingContext) {
        this.context = context;
    }

    /**
     * Format template data with translations and property definitions
     */
    formatTemplateData(templatesIds: string[]): ComposedTemplate[] {
        return this.context.templates
            .filter((template: Template) => templatesIds.includes(template._id))
            .map((template: Template) => {
                const templateTranslations = this.getTemplateTranslations(template);
                const { formattedProperties, formattedCommonProperties } = this.formatTemplateProperties(
                    template,
                    templateTranslations
                );

                return {
                    _id: template._id,
                    name: template.name,
                    label: template.label,
                    ...(templateTranslations !== undefined
                        ? { translatedLabel: templateTranslations.values[template.name] }
                        : {}),
                    color: template.color,
                    entityViewPage: template.entityViewPage,
                    commonProperties: formattedCommonProperties,
                    properties: formattedProperties,
                };
            });
    }

    /**
     * Get template translations for the current language
     */
    private getTemplateTranslations(template: Template): ClientTranslationContextSchema | undefined {
        if (!this.context.options.translateLabels || !this.context.translations) {
            return undefined;
        }

        return this.context.translations
            .find(t => t.locale === this.context.language)
            ?.contexts.find(t => t.id === template._id);
    }

    /**
     * Format template properties (both regular and common properties)
     */
    private formatTemplateProperties(
        template: Template,
        templateTranslations?: ClientTranslationContextSchema
    ): {
        formattedProperties: Map<string, any>;
        formattedCommonProperties: Map<string, any>;
    } {
        const formattedProperties = new Map<string, any>();
        const formattedCommonProperties = new Map<string, any>();

        // Filter properties based on includeFields option
        const properties = this.filterPropertiesByIncludeFields(template.properties);
        const commonProperties = this.filterPropertiesByIncludeFields(template.commonProperties);

        // Format and set properties with index
        this.formatAndSetProperties(properties, formattedProperties, templateTranslations);
        this.formatAndSetProperties(commonProperties, formattedCommonProperties, templateTranslations);

        return {
            formattedProperties,
            formattedCommonProperties,
        };
    }

    /**
     * Filter properties based on includeFields option
     */
    private filterPropertiesByIncludeFields(properties?: PropertySchema[]): PropertySchema[] {
        if (!properties) return [];

        if (this.context.options.includeFields) {
            return properties.filter(property =>
                this.context.options.includeFields?.includes(property.name)
            );
        }

        return properties;
    }

    /**
     * Format and set properties in the target map with index
     */
    private formatAndSetProperties(
        properties: PropertySchema[],
        targetMap: Map<string, any>,
        templateTranslations?: ClientTranslationContextSchema
    ): void {
        properties.forEach((property, index) => {
            const formattedProperty = this.formatPropertyDefinition(property, templateTranslations);
            targetMap.set(property.name, { ...formattedProperty, index });
        });
    }

    /**
     * Format a single property definition with translations
     */
    private formatPropertyDefinition(
        property: PropertySchema,
        templateTranslations?: ClientTranslationContextSchema
    ) {
        return {
            _id: property._id,
            name: property.name,
            label: property.label,
            type: property.type,
            ...(templateTranslations !== undefined
                ? {
                    translatedLabel: templateTranslations.values[property.label] || property.label,
                }
                : {}),
        };
    }
}
