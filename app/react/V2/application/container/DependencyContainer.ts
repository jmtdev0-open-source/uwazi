/**
 * Dependency Injection Container
 * Manages dependencies between layers
 */
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import { MetadataFormatter, MetadataFormatterImpl } from '../services/MetadataFormatter';
import { EntityCompositionUseCase } from '../useCases/EntityCompositionUseCase';
import { EntityCompositionUseCaseImpl } from '../useCases/EntityCompositionUseCase';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private entityRepository: EntityRepository | null = null;
  private metadataFormatter: MetadataFormatter | null = null;
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

  setMetadataFormatter(formatter: MetadataFormatter): void {
    this.metadataFormatter = formatter;
  }

  getEntityRepository(): EntityRepository {
    if (!this.entityRepository) {
      throw new Error('EntityRepository not registered');
    }
    return this.entityRepository;
  }

  getMetadataFormatter(): MetadataFormatter {
    if (!this.metadataFormatter) {
      this.metadataFormatter = new MetadataFormatterImpl();
    }
    return this.metadataFormatter;
  }

  getEntityCompositionUseCase(): EntityCompositionUseCase {
    if (!this.entityCompositionUseCase) {
      this.entityCompositionUseCase = new EntityCompositionUseCaseImpl(
        this.getEntityRepository(),
        this.getMetadataFormatter()
      );
    }
    return this.entityCompositionUseCase;
  }

  reset(): void {
    this.entityRepository = null;
    this.metadataFormatter = null;
    this.entityCompositionUseCase = null;
  }
}
