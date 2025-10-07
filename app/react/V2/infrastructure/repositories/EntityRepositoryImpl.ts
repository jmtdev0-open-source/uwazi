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

  async findByTemplate(templateId: string, options?: CompositionOptions): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/api/entities/template/${templateId}`, {
        params: this.buildQueryParams(options),
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data; // Return raw data directly
    } catch (error) {
      console.error('Error fetching entities by template:', error);
      return [];
    }
  }

  async findByRelationship(
    entityId: string,
    relationshipType: string,
    options?: CompositionOptions
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/api/entities/${entityId}/relationships/${relationshipType}`,
        {
          params: this.buildQueryParams(options),
        }
      );
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data; // Return raw data directly
    } catch (error) {
      console.error('Error fetching related entities:', error);
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

  async delete(entityId: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/api/entities/${entityId}`);
      return true;
    } catch (error) {
      console.error('Error deleting entity:', error);
      return false;
    }
  }

  async exists(entityId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.head(`/api/entities/${entityId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async count(options?: CompositionOptions): Promise<number> {
    try {
      const response = await this.apiClient.get('/api/entities/count', {
        params: this.buildQueryParams(options),
      });
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error counting entities:', error);
      return 0;
    }
  }

  private buildQueryParams(options?: CompositionOptions): Record<string, any> {
    if (!options) return {};

    return {
      includeTemplate: options.includeTemplate,
      includeProperties: options.includeProperties,
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
