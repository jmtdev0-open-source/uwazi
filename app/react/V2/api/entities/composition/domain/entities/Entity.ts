/**
 * Entity Domain Object
 * Core domain entity with business logic and validation
 */
import { EntityPermissions } from '../../types';

export class Entity {
  constructor(
    private readonly _id: string,
    private readonly _sharedId: string,
    private readonly _title: string,
    private readonly _language: string,
    private readonly _template: any,
    private readonly _creationDate: Date,
    private readonly _editDate?: Date,
    private readonly _icon?: any,
    private readonly _permissions?: EntityPermissions,
    private readonly _metadata?: Record<string, any>,
    private readonly _relationships?: any[],
    private readonly _files?: any,
    private readonly _navigation?: any
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

  get template(): any {
    return this._template;
  }

  get creationDate(): Date {
    return this._creationDate;
  }

  get editDate(): Date | undefined {
    return this._editDate;
  }

  get icon(): any {
    return this._icon;
  }

  get permissions(): EntityPermissions {
    return (
      this._permissions || {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canShare: false,
        userPermissions: [],
        groupPermissions: [],
        publicAccess: false,
      }
    );
  }

  get metadata(): Record<string, any> {
    return this._metadata || {};
  }

  get relationships(): any[] {
    return this._relationships || [];
  }

  get files(): any {
    return this._files || { documents: [], attachments: [], processed: false };
  }

  get navigation(): any {
    return (
      this._navigation || {
        availableTabs: {},
        defaultTab: 'info',
        hasPageView: false,
        hasRelationships: false,
        hasNewRelationships: false,
        panelOpen: false,
        copyFrom: false,
        copyFromProps: [],
      }
    );
  }

  // Business logic methods
  canBeViewedBy(userId: string, userPermissions: string[]): boolean {
    if (this.permissions.publicAccess) {
      return true;
    }
    if (this.permissions.userPermissions.includes(userId)) {
      return true;
    }
    return userPermissions.some(permission =>
      this.permissions.userPermissions.includes(permission)
    );
  }

  canBeEditedBy(userId: string, userPermissions: string[]): boolean {
    if (!this.permissions.canWrite) {
      return false;
    }
    return this.canBeViewedBy(userId, userPermissions);
  }

  canBeDeletedBy(userId: string, userPermissions: string[]): boolean {
    if (!this.permissions.canDelete) {
      return false;
    }
    return this.canBeViewedBy(userId, userPermissions);
  }

  getPropertyValue(propertyName: string): any {
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

  isValid(): boolean {
    return !!(this._id && this._sharedId && this._title && this._template && this._creationDate);
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
    };
  }
}
