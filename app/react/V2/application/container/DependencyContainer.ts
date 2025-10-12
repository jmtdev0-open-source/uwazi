import { EntityCompositionUseCase } from '../useCases/EntityCompositionUseCase';
import { EntityCompositionUseCaseImpl } from '../useCases/EntityCompositionUseCase';
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private repository: EntityRepository | null = null;
  private entityCompositionUseCase: EntityCompositionUseCase | null = null;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  setRepository(repository: EntityRepository): void {
    this.repository = repository;
  }

  getRepository(): EntityRepository {
    if (!this.repository) {
      throw new Error('Repository not registered');
    }
    return this.repository;
  }

  getEntityCompositionUseCase(): EntityCompositionUseCase {
    if (!this.entityCompositionUseCase) {
      this.entityCompositionUseCase = new EntityCompositionUseCaseImpl(this.getRepository());
    }
    return this.entityCompositionUseCase;
  }

  reset(): void {
    this.repository = null;
    this.entityCompositionUseCase = null;
  }
}
