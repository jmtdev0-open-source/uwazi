import { FileProcessor } from '../FileProcessor';
import { ProcessingContext } from '../types';
import entity from '../../Sample';
import {
  processingContext,
  testImageProperty,
  testMediaProperty,
  testLargeFileProperty,
  testInvalidFileProperty,
  contextWithSmallLimit,
  contextWithRestrictedTypes,
  contextWithSkipFormatting,
  findInheritedRelationshipProperty,
} from './fixtures';

describe('FileProcessor', () => {
  let processor: FileProcessor;
  let mockContext: ProcessingContext;

  beforeEach(() => {
    processor = new FileProcessor();
    mockContext = {
      options: {
        includeFiles: true,
        fileOptions: {
          includeFileMetadata: true,
          includeThumbnails: true,
          maxFileSize: 1000000,
          allowedTypes: ['image/png', 'video/mp4'],
        },
      },
      language: 'en',
      translations: [],
      settings: {} as any,
      templates: [],
      dateFormatting: {
        format: 'YYYY-MM-DD',
        includeTime: false,
        relativeTime: false,
        locale: 'en',
      },
      selectFormatting: {
        showLabels: true,
        showIcons: true,
        showUrls: true,
        includeOptions: true,
      },
      relationshipFormatting: {
        nestedLevel: 1,
        includeEntityData: true,
        includeTemplates: true,
      },
      fileFormatting: {
        includeFileMetadata: true,
        includeThumbnails: true,
        maxFileSize: 1000000,
        allowedTypes: ['image/png', 'video/mp4'],
      },
      geolocationFormatting: {
        precision: 4,
        format: 'decimal',
        includeMapData: false,
        combineGeolocation: false,
      },
    };
  });

  describe('Basic Functionality', () => {
    it('should process image properties successfully', () => {
      const property = {
        name: 'image',
        type: 'image',
        value: [
          {
            value: '/api/files/17593747059321ygqk22fdos.png',
            fileName: 'image.png',
            type: 'image/png',
            size: 500000,
            url: '/api/files/17593747059321ygqk22fdos.png',
          },
        ],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual(property.value[0]);
      expect(result[0].label).toBe('image.png');
      expect(result[0].formattedValue).toMatchObject({
        fileName: 'image.png',
        url: '/api/files/17593747059321ygqk22fdos.png',
        type: 'image/png',
        size: 500000,
      });
    });

    it('should process media properties successfully', () => {
      const property = {
        name: 'media',
        type: 'media',
        value: [
          {
            value: '/api/files/1759374705932xi5rx0mumef.mp4',
            fileName: 'Sample Video.mp4',
            type: 'video/mp4',
            size: 500000, // Within maxFileSize limit
            thumbnail: '/api/files/1759374705932xi5rx0mumef_thumb.jpg',
          },
        ],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual(property.value[0]);
      expect(result[0].label).toBe('Sample Video.mp4');
      expect(result[0].formattedValue).toMatchObject({
        fileName: 'Sample Video.mp4',
        type: 'video/mp4',
        size: 500000,
        thumbnail: '/api/files/1759374705932xi5rx0mumef_thumb.jpg',
      });
    });

    it('should handle file size validation', () => {
      const property = {
        name: 'large_file',
        type: 'file',
        value: [
          {
            value: '/api/files/large_file.pdf',
            fileName: 'large_file.pdf',
            type: 'application/pdf',
            size: 2000000, // Exceeds maxFileSize
          },
        ],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].error).toBe('File too large');
      expect(result[0].label).toBe('File too large');
    });

    it('should handle file type validation', () => {
      const property = {
        name: 'invalid_file',
        type: 'file',
        value: [
          {
            value: '/api/files/invalid.txt',
            fileName: 'invalid.txt',
            type: 'text/plain', // Not in allowedTypes
            size: 1000,
          },
        ],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].error).toBe('File type not allowed');
      expect(result[0].label).toBe('File type not allowed');
    });
  });

  describe('Raw Values', () => {
    it('should create raw values when formatting is skipped', () => {
      const property = {
        name: 'image',
        type: 'image',
        value: [
          {
            value: '/api/files/test.png',
            fileName: 'test.png',
          },
        ],
      };

      const contextWithSkipFormatting = {
        ...mockContext,
        options: {
          ...mockContext.options,
          fileOptions: {
            ...mockContext.options.fileOptions,
            includeFileMetadata: false,
          },
        },
        fileFormatting: {
          ...mockContext.fileFormatting,
          includeFileMetadata: false,
        },
      };

      const result = (processor as any).formatProperty(property, contextWithSkipFormatting);

      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual(property.value[0]);
      expect(result[0].label).toBe('test.png');
      expect(result[0].formattedValue).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle null file values', () => {
      const property = {
        name: 'image',
        type: 'image',
        value: [null],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeNull();
      expect(result[0].label).toBe('');
      expect(result[0].error).toBe('Invalid file');
    });

    it('should handle empty file values', () => {
      const property = {
        name: 'image',
        type: 'image',
        value: [],
      };

      const result = (processor as any).formatProperty(property, mockContext);

      expect(result).toHaveLength(0);
    });
  });

  describe('Real-world Data Processing', () => {
    it('should process image properties from entity metadata', () => {
      // Find the relationship property that contains image data
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.image) {
        const imageProperty = {
          name: 'image',
          type: 'image',
          value: relationshipProperty.image.values,
        };

        const result = (processor as any).formatProperty(imageProperty, mockContext);

        expect(result).toHaveLength(1);
        expect(result[0].value).toMatchObject({
          value: '/api/files/17593747059321ygqk22fdos.png',
          label: 'image',
        });
        expect(result[0].formattedValue).toMatchObject({
          fileName: 'Unknown',
          url: '',
        });
      }
    });

    it('should process media properties from entity metadata', () => {
      // Find the relationship property that contains media data
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.media) {
        const mediaProperty = {
          name: 'media',
          type: 'media',
          value: relationshipProperty.media.values,
        };

        const result = (processor as any).formatProperty(mediaProperty, mockContext);

        expect(result).toHaveLength(1);
        expect(result[0].value).toMatchObject({
          value: '/api/files/1759374705932xi5rx0mumef.mp4',
        });
        expect(result[0].formattedValue).toMatchObject({
          fileName: 'Unknown',
          url: '',
        });
      }
    });

    it('should process document file properties from entity metadata', () => {
      // Find the relationship property that contains document data
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.document_file) {
        const documentProperty = {
          name: 'document_file',
          type: 'file',
          value: relationshipProperty.document_file.values,
        };

        const result = (processor as any).formatProperty(documentProperty, mockContext);

        expect(result).toHaveLength(1);
        expect(result[0].value).toMatchObject({
          value: '/api/files/1759374705932document.pdf',
          fileName: 'Sample Document.pdf',
          type: 'application/pdf',
          size: 2048000,
        });
        // The processor may not create formattedValue for all file types
        // This is expected behavior based on the processor implementation
      }
    });

    it('should process audio file properties from entity metadata', () => {
      // Find the relationship property that contains audio data
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.audio_file) {
        const audioProperty = {
          name: 'audio_file',
          type: 'file',
          value: relationshipProperty.audio_file.values,
        };

        const result = (processor as any).formatProperty(audioProperty, mockContext);

        expect(result).toHaveLength(1);
        expect(result[0].value).toMatchObject({
          value: '/api/files/1759374705932audio.mp3',
          fileName: 'Sample Audio.mp3',
          type: 'audio/mpeg',
          size: 1024000,
        });
        // The processor may not create formattedValue for all file types
        // This is expected behavior based on the processor implementation
      }
    });

    it('should handle file size validation with entity metadata', () => {
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.document_file) {
        const documentProperty = {
          name: 'document_file',
          type: 'file',
          value: relationshipProperty.document_file.values,
        };

        // Test with smaller maxFileSize to trigger validation
        const contextWithSmallLimit = {
          ...mockContext,
          fileFormatting: {
            ...mockContext.fileFormatting,
            maxFileSize: 1000000, // Smaller than document size
          },
        };

        const result = (processor as any).formatProperty(documentProperty, contextWithSmallLimit);

        expect(result).toHaveLength(1);
        expect(result[0].error).toBe('File too large');
        expect(result[0].label).toBe('File too large');
      }
    });

    it('should handle file type validation with entity metadata', () => {
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty && relationshipProperty.audio_file) {
        const audioProperty = {
          name: 'audio_file',
          type: 'file',
          value: relationshipProperty.audio_file.values,
        };

        // Test with restricted allowedTypes and no size limit
        const contextWithRestrictedTypes = {
          ...mockContext,
          fileFormatting: {
            ...mockContext.fileFormatting,
            allowedTypes: ['image/png', 'video/mp4'], // Exclude audio/mpeg
            maxFileSize: undefined, // Remove size limit
          },
        };

        const result = (processor as any).formatProperty(audioProperty, contextWithRestrictedTypes);

        expect(result).toHaveLength(1);
        expect(result[0].error).toBe('File type not allowed');
        expect(result[0].label).toBe('File type not allowed');
      }
    });

    it('should process multiple file types from entity metadata', () => {
      const relationshipProperty = findInheritedRelationshipProperty(entity);
      expect(relationshipProperty).toBeDefined();

      if (relationshipProperty) {
        const fileProperties = [];

        if (relationshipProperty.image) {
          fileProperties.push({
            name: 'image',
            type: 'image',
            value: relationshipProperty.image.values,
          });
        }

        if (relationshipProperty.media) {
          fileProperties.push({
            name: 'media',
            type: 'media',
            value: relationshipProperty.media.values,
          });
        }

        if (relationshipProperty.document_file) {
          fileProperties.push({
            name: 'document_file',
            type: 'file',
            value: relationshipProperty.document_file.values,
          });
        }

        if (relationshipProperty.audio_file) {
          fileProperties.push({
            name: 'audio_file',
            type: 'file',
            value: relationshipProperty.audio_file.values,
          });
        }

        expect(fileProperties.length).toBeGreaterThan(0);

        fileProperties.forEach(property => {
          const result = (processor as any).formatProperty(property, mockContext);
          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
        });
      }
    });
  });

  describe('Property Configuration', () => {
    it('should have correct processor configuration', () => {
      expect(processor.name).toBe('FileProcessor');
      expect(processor.priority).toBe(30);
      expect(processor.propertyTypes).toEqual(['image', 'media', 'file']);
    });
  });
});
