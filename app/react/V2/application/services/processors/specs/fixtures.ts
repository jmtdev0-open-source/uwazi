import { CompositionOptions } from 'app/V2/domain';
import { ProcessingContext } from '../types';

export const processingContext: ProcessingContext = {
  options: {
    includeMetadata: true,
    includePropertyMetadata: true,
    translateLabels: true,
  } as CompositionOptions,
  language: 'en',
  userId: 'user123',
  userPermissions: ['read', 'write'],
  translations: [],
  settings: {},
  templates: [],
  dateFormatting: {
    format: 'YYYY-MM-DD',
    timezone: 'UTC',
    includeTime: false,
    relativeTime: false,
    locale: 'en',
  },
  selectFormatting: {
    showLabels: true,
    showIcons: false,
    showUrls: false,
    includeOptions: false,
  },
  relationshipFormatting: {
    nestedLevel: 1,
    includeEntityData: false,
    includeTemplates: false,
  },
  fileFormatting: {
    includeFileMetadata: false,
    includeThumbnails: false,
  },
  geolocationFormatting: {
    precision: 4,
    format: 'decimal',
    includeMapData: false,
    combineGeolocation: false,
  },
};

// Common test properties for file processing
export const testImageProperty = {
  name: 'image',
  type: 'image',
  value: [
    {
      fileName: 'test-image.jpg',
      url: '/api/files/test-image.jpg',
      type: 'image/jpeg',
      size: 1024,
    },
  ],
};

export const testMediaProperty = {
  name: 'media',
  type: 'media',
  value: [
    {
      fileName: 'test-video.mp4',
      url: '/api/files/test-video.mp4',
      type: 'video/mp4',
      size: 1024000,
    },
  ],
};

export const testLargeFileProperty = {
  name: 'large_file',
  type: 'file',
  value: [
    {
      fileName: 'large-document.pdf',
      url: '/api/files/large-document.pdf',
      type: 'application/pdf',
      size: 5000000, // 5MB
    },
  ],
};

export const testInvalidFileProperty = {
  name: 'invalid_file',
  type: 'file',
  value: [
    {
      fileName: 'malware.exe',
      url: '/api/files/malware.exe',
      type: 'application/x-executable',
      size: 1024,
    },
  ],
};

// Context variations for testing
export const contextWithSmallLimit = {
  ...processingContext,
  fileFormatting: {
    ...processingContext.fileFormatting,
    maxFileSize: 1000, // 1KB limit
  },
};

export const contextWithRestrictedTypes = {
  ...processingContext,
  fileFormatting: {
    ...processingContext.fileFormatting,
    allowedTypes: ['image/jpeg', 'image/png'],
    maxFileSize: undefined,
  },
};

export const contextWithSkipFormatting = {
  ...processingContext,
  options: {
    ...processingContext.options,
    includeMetadata: false,
  },
};

// Helper functions to reduce duplication in tests
export const findRelationshipProperty = (entity: any) => {
  return entity.metadata.find((prop: any) => prop.name === 'relationship');
};

export const findInheritedRelationshipProperty = (entity: any) => {
  return entity.metadata.find(
    (prop: any) => prop.name === 'relationship' && prop.inherited === true
  );
};

export const findGeolocationProperty = (entity: any) => {
  return entity.metadata.find((prop: any) => prop.name === 'geolocationisolated');
};

export const findGeolocationProperties = (entity: any) => {
  return entity.metadata.filter((prop: any) =>
    ['geolocationisolated', 'combined_geolocation', 'geolocation_cluster'].includes(prop.name)
  );
};

export const findRelationshipProperties = (entity: any) => {
  return entity.metadata.filter(
    (prop: any) => prop.type === 'relationship' || prop.name.includes('relationship')
  );
};
