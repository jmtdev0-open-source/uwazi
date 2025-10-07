/**
 * Entity Repository Interface
 * Abstraction for data access operations
 */
import { IncomingHttpHeaders } from 'http';
import { CompositionOptions } from '../../domain/entities/types';
import { EntitySchema } from 'api/migrations/migrations/143-parse-numeric-fields/types';

export interface EntityRepository {
  findBySharedId(
    entityId: string,
    options?: CompositionOptions,
    headers?: IncomingHttpHeaders
  ): Promise<EntitySchema | null>;
  findByIds(entityIds: string[], options?: CompositionOptions): Promise<EntitySchema[]>;
  save(entity: EntitySchema): Promise<EntitySchema>;
}
