/**
 * Dependency Injection Container
 * Manages dependencies between layers
 */
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import { EntityCompositionUseCase } from '../useCases/EntityCompositionUseCase';
import { EntityCompositionUseCaseImpl } from '../useCases/EntityCompositionUseCase';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private entityRepository: EntityRepository | null = null;
  private entityCompositionUseCase: EntityCompositionUseCase | null = null;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  setEntityRepository(repository: EntityRepository): void {
    this.entityRepository = repository;
  }

  getEntityRepository(): EntityRepository {
    if (!this.entityRepository) {
      throw new Error('EntityRepository not registered');
    }
    return this.entityRepository;
  }

  getEntityCompositionUseCase(): EntityCompositionUseCase {
    if (!this.entityCompositionUseCase) {
      this.entityCompositionUseCase = new EntityCompositionUseCaseImpl(this.getEntityRepository());
    }
    return this.entityCompositionUseCase;
  }

  reset(): void {
    this.entityRepository = null;
    this.entityCompositionUseCase = null;
  }
}
