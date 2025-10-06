/**
 * Composition Service Factory
 * Handles dependency injection setup for the composition system
 */
import { DependencyContainer } from '../container/DependencyContainer';
import { EntityRepositoryImpl } from '../../infrastructure/repositories/EntityRepositoryImpl';
import { EntityCompositionUseCase } from '../use-cases/EntityCompositionUseCase';

export class CompositionServiceFactory {
  private static container: DependencyContainer | null = null;

  static async createCompositionService(apiClient: any): Promise<EntityCompositionUseCase> {
    if (!this.container) {
      this.container = DependencyContainer.getInstance();

      // Set up the repository with the provided API client
      this.container.setEntityRepository(new EntityRepositoryImpl(apiClient));
    }

    return this.container.getEntityCompositionUseCase();
  }

  static reset(): void {
    if (this.container) {
      this.container.reset();
      this.container = null;
    }
  }
}







