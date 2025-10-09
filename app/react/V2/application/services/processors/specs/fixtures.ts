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
