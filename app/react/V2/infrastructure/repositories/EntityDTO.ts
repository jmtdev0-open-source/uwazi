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
} from '../../domain/entities/types';

export interface EntityDTO {
  readonly _id: string;
  readonly sharedId: string;
  readonly title: string;
  readonly language: string;
  readonly template?: ComposedTemplate;
  readonly creationDate?: Date;
  readonly editDate?: Date;
  readonly icon?: any;
  readonly permissions?: EntityPermissions;
  readonly metadata?: Record<string, any>;
  readonly relationships?: ComposedRelationshipData;
  readonly files?: ComposedFileData;
  readonly navigation?: ComposedNavigationData;
  readonly rawData?: any;
}
