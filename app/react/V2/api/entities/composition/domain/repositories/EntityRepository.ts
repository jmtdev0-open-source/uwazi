/**
 * Entity Repository Interface
 * Abstraction for data access operations
 */
import { CompositionOptions } from '../../types';
import { IncomingHttpHeaders } from 'http';

export interface EntityRepository {
  findBySharedId(
    entityId: string,
    options?: CompositionOptions,
    headers?: IncomingHttpHeaders
  ): Promise<any | null>;
  findByIds(entityIds: string[], options?: CompositionOptions): Promise<any[]>;
  findByTemplate(templateId: string, options?: CompositionOptions): Promise<any[]>;
  findByRelationship(
    entityId: string,
    relationshipType: string,
    options?: CompositionOptions
  ): Promise<any[]>;
  save(entity: any): Promise<any>;
  delete(entityId: string): Promise<boolean>;
  exists(entityId: string): Promise<boolean>;
  count(options?: CompositionOptions): Promise<number>;
}
