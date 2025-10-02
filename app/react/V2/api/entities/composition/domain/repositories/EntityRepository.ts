/**
 * Entity Repository Interface
 * Abstraction for data access operations
 */
import { Entity } from '../entities/Entity';
import { CompositionOptions } from '../../types';

export interface EntityRepository {
  findById(entityId: string, options?: CompositionOptions): Promise<Entity | null>;
  findByIds(entityIds: string[], options?: CompositionOptions): Promise<Entity[]>;
  findByTemplate(templateId: string, options?: CompositionOptions): Promise<Entity[]>;
  findByRelationship(
    entityId: string,
    relationshipType: string,
    options?: CompositionOptions
  ): Promise<Entity[]>;
  save(entity: Entity): Promise<Entity>;
  delete(entityId: string): Promise<boolean>;
  exists(entityId: string): Promise<boolean>;
  count(options?: CompositionOptions): Promise<number>;
}
