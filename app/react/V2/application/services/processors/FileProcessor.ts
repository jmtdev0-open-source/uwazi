/**
 * File Property Processor
 * Specialized processor for handling file and media properties with standardized structure
 */
import { BasePropertyProcessor } from './BasePropertyProcessor';
import { PropertyValue, ProcessingContext } from './types';

export class FileProcessor extends BasePropertyProcessor {
  readonly name = 'FileProcessor';
  readonly priority = 30;
  readonly propertyTypes = ['image', 'media', 'file'];

  protected formatProperty(property: any, context: ProcessingContext): PropertyValue[] {
    if (this.shouldSkipFormatting(context, 'file')) {
      return this.createRawValues(property);
    }

    return this.formatFileProperty(property, context);
  }

  /**
   * Create raw values for file properties
   */
  protected createRawValues(property: any): PropertyValue[] {
    const values = Array.isArray(property.value) ? property.value : [property.value];
    return values.map((file: any) => {
      if (!file) {
        return {
          value: file,
          label: '',
          displayValue: '',
        };
      }
      return {
        value: file,
        label: file.fileName || file.originalname || 'Unknown',
        displayValue: file.fileName || file.originalname || 'Unknown',
      };
    });
  }

  /**
   * Check if file formatting should be skipped
   */
  protected shouldSkipFormatting(context: ProcessingContext, formatKey?: string): boolean {
    if (formatKey === 'file') {
      return context.options.fileOptions?.includeFileMetadata === false;
    }
    return false;
  }

  private formatFileProperty(property: any, context: ProcessingContext): PropertyValue[] {
    const fileFormatting = {
      includeFileMetadata: context.includeFileMetadata,
      includeThumbnails: context.includeThumbnails,
      maxFileSize: context.maxFileSize,
      allowedTypes: context.allowedTypes,
    };
    const values = Array.isArray(property.value) ? property.value : [property.value];

    return values.map((file: any) => {
      if (!file) {
        return {
          value: file,
          label: '',
          displayValue: '',
          error: 'Invalid file',
        };
      }

      // Validate file size
      if (fileFormatting.maxFileSize && file.size && file.size > fileFormatting.maxFileSize) {
        return {
          value: file,
          label: 'File too large',
          displayValue: 'File too large',
          error: 'File too large',
        };
      }

      // Validate file type
      if (
        fileFormatting.allowedTypes &&
        file.type &&
        !fileFormatting.allowedTypes.includes(file.type)
      ) {
        return {
          value: file,
          label: 'File type not allowed',
          displayValue: 'File type not allowed',
          error: 'File type not allowed',
        };
      }

      const fileName = file.fileName || file.originalname || 'Unknown';
      const url = file.url || '';
      const type = file.type || 'unknown';
      const size = file.size || 0;
      const style = file.style || 'default';
      const label = file.label || fileName;

      const formattedValue: any = {
        fileName,
        url,
        type,
        style,
        label,
      };

      if (fileFormatting.includeFileMetadata) {
        formattedValue.size = size;
        formattedValue.mimeType = file.mimeType;
        formattedValue.uploadDate = file.uploadDate;
      }

      if (fileFormatting.includeThumbnails && file.thumbnail) {
        formattedValue.thumbnail = file.thumbnail;
      }

      return {
        value: file,
        label: label || fileName,
        displayValue: label || fileName,
        formattedValue,
      };
    });
  }
}
