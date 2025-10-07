import { IncomingHttpHeaders } from 'http';
import { EntityRepository } from './EntityRepository';
import { CompositionOptions } from '../../domain/entities/types';
import { EntityDTO } from './EntityDTO';

export class EntityRepositoryImpl implements EntityRepository {
  constructor(private readonly apiClient: any) {}

  async findBySharedId(
    entityId: string,
    _options?: CompositionOptions,
    headers?: IncomingHttpHeaders
  ): Promise<EntityDTO | null> {
    try {
      const response = await this.apiClient.getBySharedId(
        {
          sharedId: entityId,
          language: 'en',
          omitRelationships: true,
        },
        headers
      );

      if (!response || response.length === 0) {
        return null;
      }

      return response[0]; // Return raw data directly
    } catch (error) {
      console.error('Error fetching entity:', error);
      return null;
    }
  }

  async findByIds(entityIds: string[], options?: CompositionOptions): Promise<any[]> {
    try {
      const response = await this.apiClient.post('/api/entities/batch', {
        entityIds,
        options: this.buildQueryParams(options),
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data; // Return raw data directly
    } catch (error) {
      console.error('Error fetching entities:', error);
      return [];
    }
  }

  async save(entity: any): Promise<any> {
    try {
      const response = await this.apiClient.put(`/api/entities/${entity.id}`, entity);
      return response; // Return raw data directly
    } catch (error) {
      console.error('Error saving entity:', error);
      throw error;
    }
  }

  private buildQueryParams(options?: CompositionOptions): Record<string, any> {
    if (!options) return {};

    return {
      includeTemplate: options.includeTemplate,
      includeMetadata: options.includeMetadata,
      includeRelationships: options.includeRelationships,
      includeFiles: options.includeFiles,
      includeNavigation: options.includeNavigation,
      includePermissions: options.includePermissions,
      onlyForCards: options.onlyForCards,
      excludePreview: options.excludePreview,
      batchSize: options.batchSize,
      maxConcurrency: options.maxConcurrency,
      userId: options.userId,
      userPermissions: options.userPermissions,
      language: options.language,
    };
  }
}
