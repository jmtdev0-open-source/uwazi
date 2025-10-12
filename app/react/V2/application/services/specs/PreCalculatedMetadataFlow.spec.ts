import { CompositionOptions } from 'app/V2/domain';
import { EntityAdapterProcessor } from '../processors/EntityAdapterProcessor';
import { ProcessingContext } from '../processors/types';
import { settings, singleEntity, templates, translations } from './fixtures';
import { EntitySchema } from 'shared/types/entityType';

describe('Pre-Calculated Metadata Flow', () => {
  let testEntities: any[];
  let testOptions: CompositionOptions;

  beforeEach(() => {
    testEntities = singleEntity;
    testOptions = {
      includeMetadata: true,
      includePropertyMetadata: true,
      translateLabels: true,
      dateOptions: {
        dateFormat: 'YYYY-MM-DD',
        includeTime: false,
        relativeTime: false,
      },
      selectOptions: {
        showLabels: true,
        showIcons: false,
        showUrls: false,
      },
    };
  });

  describe('Entity Processing Flow', () => {
    it('should process entities successfully', async () => {
      const processingContext: ProcessingContext = {
        options: testOptions,
        language: 'en',
        userId: 'user123',
        userPermissions: ['read', 'write'],
        settings: settings as any,
        templates: templates as any,
        translations: translations as any,
        thesauri: [],
        // Flattened formatting options
        dateFormat: testOptions.dateOptions?.dateFormat || 'YYYY-MM-DD',
        timezone: testOptions.dateOptions?.timezone,
        includeTime: testOptions.dateOptions?.includeTime || false,
        relativeTime: testOptions.dateOptions?.relativeTime || false,
        locale: testOptions.dateOptions?.locale || 'en',
        showLabels: testOptions.selectOptions?.showLabels !== false,
        showIcons: testOptions.selectOptions?.showIcons || false,
        showUrls: testOptions.selectOptions?.showUrls || false,
        includeOptions: testOptions.selectOptions?.includeOptions || false,
        nestedLevel: testOptions.relationshipOptions?.nestedLevel || 1,
        includeEntityData: testOptions.relationshipOptions?.includeEntityData || false,
        includeTemplates: testOptions.relationshipOptions?.includeTemplates || false,
        maxRelationships: testOptions.relationshipOptions?.maxRelationships,
        includeFileMetadata: testOptions.fileOptions?.includeFileMetadata || false,
        includeThumbnails: testOptions.fileOptions?.includeThumbnails || false,
        maxFileSize: testOptions.fileOptions?.maxFileSize,
        allowedTypes: testOptions.fileOptions?.allowedTypes,
        precision: testOptions.geolocationOptions?.precision || 6,
        includeMapData: testOptions.geolocationOptions?.includeMapData || false,
        combineGeolocation: testOptions.geolocationOptions?.combineGeolocation || false,
      };
      const processor = new EntityAdapterProcessor(processingContext);

      const result = await processor.processAllEntities(testEntities);

      console.log(JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.entities).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      const processingContext: ProcessingContext = {
        options: testOptions,
        language: 'en',
        userId: 'user123',
        userPermissions: ['read', 'write'],
        settings: settings as any,
        templates: templates as any,
        translations: translations as any,
        thesauri: [],
        // Flattened formatting options
        dateFormat: testOptions.dateOptions?.dateFormat || 'YYYY-MM-DD',
        timezone: testOptions.dateOptions?.timezone,
        includeTime: testOptions.dateOptions?.includeTime || false,
        relativeTime: testOptions.dateOptions?.relativeTime || false,
        locale: testOptions.dateOptions?.locale || 'en',
        showLabels: testOptions.selectOptions?.showLabels !== false,
        showIcons: testOptions.selectOptions?.showIcons || false,
        showUrls: testOptions.selectOptions?.showUrls || false,
        includeOptions: testOptions.selectOptions?.includeOptions || false,
        nestedLevel: testOptions.relationshipOptions?.nestedLevel || 1,
        includeEntityData: testOptions.relationshipOptions?.includeEntityData || false,
        includeTemplates: testOptions.relationshipOptions?.includeTemplates || false,
        maxRelationships: testOptions.relationshipOptions?.maxRelationships,
        includeFileMetadata: testOptions.fileOptions?.includeFileMetadata || false,
        includeThumbnails: testOptions.fileOptions?.includeThumbnails || false,
        maxFileSize: testOptions.fileOptions?.maxFileSize,
        allowedTypes: testOptions.fileOptions?.allowedTypes,
        precision: testOptions.geolocationOptions?.precision || 6,
        includeMapData: testOptions.geolocationOptions?.includeMapData || false,
        combineGeolocation: testOptions.geolocationOptions?.combineGeolocation || false,
      };
      const processor = new EntityAdapterProcessor(processingContext);

      const invalidEntities = [
        {
          _id: 'invalid',
          metadata: {
            invalidField: { type: 'invalid', value: null },
          },
        },
      ];

      const result = await processor.processAllEntities(
        invalidEntities as unknown as EntitySchema[]
      );

      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.entities).toBeDefined();
    });
  });
});
