/**
 * Entity Repository Interface
 * Abstraction for data access operations
 */
import { IncomingHttpHeaders } from 'http';
import { CompositionOptions } from '../../domain/entities/types';
import { EntityDTO } from './EntityDTO';

export interface EntityRepository {
  findBySharedId(
    entityId: string,
    options?: CompositionOptions,
    headers?: IncomingHttpHeaders
  ): Promise<EntityDTO | null>;
  findByIds(entityIds: string[], options?: CompositionOptions): Promise<EntityDTO[]>;
  save(entity: EntityDTO): Promise<EntityDTO>;
}
