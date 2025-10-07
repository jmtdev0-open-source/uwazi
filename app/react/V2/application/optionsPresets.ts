import { CompositionOptions } from '../domain/entities/types';

// Standardized option presets to avoid duplication across loaders/hooks
// These mirror the fluent API patterns but provide direct option objects

export const fullDetailOptions = (dateFormat: string = 'YYYY-MM-DD'): CompositionOptions => ({
  includeTemplate: true,
  includeMetadata: true,
  includeRelationships: true,
  includeFiles: true,
  includeNavigation: true,
  includePermissions: true,
  dateFormat,
  includePropertyMetadata: true,
});

export const cardViewOptions = (): CompositionOptions => ({
  includeTemplate: true,
  includeMetadata: true,
  includeRelationships: false,
  includeFiles: false,
  includeNavigation: false,
  includePermissions: true,
  onlyForCards: true,
});

export const dateFieldsOptions = (dateFormat: string = 'YYYY-MM-DD'): CompositionOptions => ({
  includeTemplate: true,
  includeMetadata: true,
  includeRelationships: false,
  includeFiles: false,
  includeNavigation: false,
  includePermissions: false,
  includeFields: ['date', 'daterange', 'multidate'],
  dateFormat,
  includePropertyMetadata: true,
});

export const selectFieldsOptions = (): CompositionOptions => ({
  includeTemplate: true,
  includeMetadata: true,
  includeRelationships: true,
  includeFiles: false,
  includeNavigation: false,
  includePermissions: false,
  includeFields: ['select', 'multiselect', 'relationship'],
  includePropertyMetadata: true,
});
