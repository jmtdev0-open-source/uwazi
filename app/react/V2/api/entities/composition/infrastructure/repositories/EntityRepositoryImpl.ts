/**
 * Entity Repository Implementation
 * Concrete implementation of EntityRepository
 */
import { Entity } from '../../domain/entities/Entity';
import { EntityRepository } from '../../domain/repositories/EntityRepository';
import { CompositionOptions } from '../../types';

export class EntityRepositoryImpl implements EntityRepository {
  constructor(private readonly apiClient: any) {}

  async findById(entityId: string, options?: CompositionOptions): Promise<Entity | null> {
    try {
      const response = await this.apiClient.get(`/entities/${entityId}`, {
        params: this.buildQueryParams(options),
      });

      if (!response.data) {
        return null;
      }

      return this.mapToEntity(response.data);
    } catch (error) {
      console.error('Error fetching entity:', error);
      return null;
    }
  }

  async findByIds(entityIds: string[], options?: CompositionOptions): Promise<Entity[]> {
    try {
      const response = await this.apiClient.post('/entities/batch', {
        entityIds,
        options: this.buildQueryParams(options),
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((entityData: any) => this.mapToEntity(entityData));
    } catch (error) {
      console.error('Error fetching entities:', error);
      return [];
    }
  }

  async findByTemplate(templateId: string, options?: CompositionOptions): Promise<Entity[]> {
    try {
      const response = await this.apiClient.get(`/entities/template/${templateId}`, {
        params: this.buildQueryParams(options),
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((entityData: any) => this.mapToEntity(entityData));
    } catch (error) {
      console.error('Error fetching entities by template:', error);
      return [];
    }
  }

  async findByRelationship(
    entityId: string,
    relationshipType: string,
    options?: CompositionOptions
  ): Promise<Entity[]> {
    try {
      const response = await this.apiClient.get(
        `/entities/${entityId}/relationships/${relationshipType}`,
        {
          params: this.buildQueryParams(options),
        }
      );
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((entityData: any) => this.mapToEntity(entityData));
    } catch (error) {
      console.error('Error fetching related entities:', error);
      return [];
    }
  }

  async save(entity: Entity): Promise<Entity> {
    try {
      const response = await this.apiClient.put(`/entities/${entity.id}`, entity.toJSON());
      return this.mapToEntity(response.data);
    } catch (error) {
      console.error('Error saving entity:', error);
      throw error;
    }
  }

  async delete(entityId: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/entities/${entityId}`);
      return true;
    } catch (error) {
      console.error('Error deleting entity:', error);
      return false;
    }
  }

  async exists(entityId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.head(`/entities/${entityId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async count(options?: CompositionOptions): Promise<number> {
    try {
      const response = await this.apiClient.get('/entities/count', {
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
      newRelationshipsEnabled: options.newRelationshipsEnabled,
      batchSize: options.batchSize,
      maxConcurrency: options.maxConcurrency,
      userId: options.userId,
      userPermissions: options.userPermissions,
      language: options.language,
    };
  }

  private mapToEntity(entityData: any): Entity {
    return new Entity(
      entityData._id || entityData.id,
      entityData.sharedId,
      entityData.title,
      entityData.language || 'en',
      entityData.template,
      new Date(entityData.creationDate),
      entityData.editDate ? new Date(entityData.editDate) : undefined,
      entityData.icon,
      entityData.permissions,
      entityData.metadata,
      entityData.relationships,
      entityData.files,
      entityData.navigation
    );
  }
}
