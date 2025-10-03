/**
 * Entity Domain Object
 * Core domain entity with business logic, validation, and rich composition
 */
import {
  EntityPermissions,
  ComposedTemplate,
  ComposedRelationshipData,
  ComposedFileData,
  ComposedNavigationData,
  LegacyFormattedData,
} from '../../types';

export class Entity {
  constructor(
    private readonly _id: string,
    private readonly _sharedId: string,
    private readonly _title: string,
    private readonly _language: string,
    private readonly _template?: ComposedTemplate,
    private readonly _creationDate?: Date,
    private readonly _editDate?: Date,
    private readonly _icon?: any,
    private readonly _permissions?: EntityPermissions,
    private readonly _metadata?: Record<string, any>,
    private readonly _relationships?: ComposedRelationshipData,
    private readonly _files?: ComposedFileData,
    private readonly _navigation?: ComposedNavigationData,
    private readonly _rawData?: any,
    private readonly _formattedData?: LegacyFormattedData
  ) {}

  // Getters for immutable access
  get id(): string {
    return this._id;
  }

  get sharedId(): string {
    return this._sharedId;
  }

  get title(): string {
    return this._title;
  }

  get language(): string {
    return this._language;
  }

  get template(): ComposedTemplate | undefined {
    return this._template;
  }

  get creationDate(): Date | undefined {
    return this._creationDate;
  }

  get editDate(): Date | undefined {
    return this._editDate;
  }

  get icon(): any {
    return this._icon;
  }

  get permissions(): EntityPermissions | undefined {
    return this._permissions;
  }

  get metadata(): Record<string, any> {
    return this._metadata || {};
  }

  get relationships(): ComposedRelationshipData | undefined {
    return this._relationships;
  }

  get files(): ComposedFileData | undefined {
    return this._files;
  }

  get navigation(): ComposedNavigationData | undefined {
    return this._navigation;
  }

  get rawData(): any {
    return this._rawData;
  }

  get formattedData(): LegacyFormattedData | undefined {
    return this._formattedData;
  }

  // Business logic methods
  hasMetadata(): boolean {
    return Object.keys(this.metadata).length > 0;
  }

  hasRelationships(): boolean {
    return this.relationships
      ? this.relationships.hubs?.length > 0 || this.relationships.connections?.length > 0
      : false;
  }

  hasFiles(): boolean {
    return this.files
      ? this.files.documents?.length > 0 || this.files.attachments?.length > 0
      : false;
  }

  getPropertyValue(propertyName: string): any {
    const property = this.metadata[propertyName];
    if (!property) return undefined;

    // Return formatted value if available, otherwise raw value
    return property.formattedValue || property.displayValue || property.value;
  }

  getRawPropertyValue(propertyName: string): any {
    return this.metadata[propertyName]?.value;
  }

  getFormattedPropertyValue(propertyName: string): any {
    return this.metadata[propertyName]?.formattedValue;
  }

  hasProperty(propertyName: string): boolean {
    return propertyName in this.metadata;
  }

  getPropertiesByType(type: string): Record<string, any> {
    return Object.fromEntries(
      Object.entries(this.metadata).filter(([_, property]) => property.type === type)
    );
  }

  getCardProperties(): Record<string, any> {
    return Object.fromEntries(
      Object.entries(this.metadata).filter(([_, property]) => property.showInCard)
    );
  }

  getDateProperties(): Record<string, any> {
    return this.getPropertiesByType('date');
  }

  getSelectProperties(): Record<string, any> {
    return Object.fromEntries(
      Object.entries(this.metadata).filter(([_, property]) =>
        ['select', 'multiselect', 'relationship'].includes(property.type)
      )
    );
  }

  getFormattedProperties(): Record<string, any> {
    return Object.fromEntries(
      Object.entries(this.metadata).filter(
        ([_, property]) => property.formattedValue || property.displayValue
      )
    );
  }

  // Rich relationship methods
  getRelationshipHubs(): any[] {
    return this.relationships?.hubs || [];
  }

  getRelationshipConnections(): any[] {
    return this.relationships?.connections || [];
  }

  getRelationshipSummary(): { totalConnections: number; hubCount: number } {
    return this.relationships?.summary || { totalConnections: 0, hubCount: 0 };
  }

  // Rich file methods
  getDocuments(): any[] {
    return this.files?.documents || [];
  }

  getAttachments(): any[] {
    return this.files?.attachments || [];
  }

  getTotalFileSize(): number {
    const documents = this.getDocuments();
    const attachments = this.getAttachments();
    return [...documents, ...attachments].reduce((total, file) => total + (file.size || 0), 0);
  }

  // Rich navigation methods
  getAvailableTabs(): Record<string, any> {
    return this.navigation?.availableTabs || {};
  }

  getDefaultTab(): string {
    return this.navigation?.defaultTab || 'info';
  }

  hasPageView(): boolean {
    return this.navigation?.hasPageView || false;
  }

  hasNewRelationships(): boolean {
    return this.navigation?.hasNewRelationships || false;
  }

  // Template methods
  getTemplateProperties(): any[] {
    return this.template?.properties || [];
  }

  getTemplatePropertyById(propertyId: string): any {
    return this.template?.properties?.find(prop => prop.id === propertyId);
  }

  canBeViewedBy(userId: string, userPermissions: string[]): boolean {
    if (!this.permissions) return false;
    if (this.permissions.publicAccess) return true;
    if (this.permissions.userPermissions.includes(userId)) return true;
    return userPermissions.some(permission =>
      this.permissions?.userPermissions.includes(permission)
    );
  }

  canBeEditedBy(userId: string, userPermissions: string[]): boolean {
    if (!this.permissions?.canWrite) return false;
    return this.canBeViewedBy(userId, userPermissions);
  }

  canBeDeletedBy(userId: string, userPermissions: string[]): boolean {
    if (!this.permissions?.canDelete) return false;
    return this.canBeViewedBy(userId, userPermissions);
  }

  isValid(): boolean {
    return !!(this._id && this._sharedId && this._title);
  }

  hasCompositionData(): boolean {
    return !!(this._rawData || this._formattedData);
  }

  getCompositionSummary(): {
    totalProperties: number;
    formattedProperties: number;
    relationshipsCount: number;
    filesCount: number;
  } {
    const totalProperties = Object.keys(this.metadata).length;
    const formattedProperties = Object.values(this.metadata).filter(
      (property: any) => property.formattedValue || property.displayValue
    ).length;
    const relationshipsCount = this.relationships
      ? (this.relationships.hubs?.length || 0) + (this.relationships.connections?.length || 0)
      : 0;
    const filesCount = this.files
      ? (this.files.documents?.length || 0) + (this.files.attachments?.length || 0)
      : 0;

    return {
      totalProperties,
      formattedProperties,
      relationshipsCount,
      filesCount,
    };
  }

  toJSON(): any {
    return {
      id: this._id,
      sharedId: this._sharedId,
      title: this._title,
      language: this._language,
      template: this._template,
      creationDate: this._creationDate,
      editDate: this._editDate,
      icon: this._icon,
      permissions: this._permissions,
      metadata: this._metadata,
      relationships: this._relationships,
      files: this._files,
      navigation: this._navigation,
      rawData: this._rawData,
      formattedData: this._formattedData,
    };
  }

  // Factory method to create from raw entity data
  static fromRawEntity(rawEntity: any, options: any = {}): Entity {
    return new Entity(
      rawEntity._id || rawEntity.id,
      rawEntity.sharedId,
      rawEntity.title,
      rawEntity.language,
      options.includeTemplate ? rawEntity.template : undefined,
      rawEntity.creationDate,
      rawEntity.editDate,
      rawEntity.icon,
      options.includePermissions ? rawEntity.permissions : undefined,
      options.includeMetadata ? rawEntity.metadata : undefined,
      options.includeRelationships ? rawEntity.relationships : undefined,
      options.includeFiles ? rawEntity.files : undefined,
      options.includeNavigation ? rawEntity.navigation : undefined,
      rawEntity,
      options.formattedData
    );
  }
}
