/**
 * Dependency Injection Container
 * Manages dependencies between layers
 */
import { EntityRepository } from '../../domain/repositories/EntityRepository';
import { EntityCompositionService } from '../../domain/services/EntityCompositionService';
import { EntityCompositionServiceImpl } from '../../domain/services/EntityCompositionServiceImpl';
import {
  LegacyMetadataFormatter,
  LegacyMetadataFormatterImpl,
} from '../../domain/services/LegacyMetadataFormatter';
import { EntityCompositionUseCase } from '../use-cases/EntityCompositionUseCase';
import { EntityCompositionUseCaseImpl } from '../use-cases/EntityCompositionUseCase';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private entityRepository: EntityRepository | null = null;
  private entityCompositionService: EntityCompositionService | null = null;
  private legacyMetadataFormatter: LegacyMetadataFormatter | null = null;
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

  setEntityCompositionService(service: EntityCompositionService): void {
    this.entityCompositionService = service;
  }

  setLegacyMetadataFormatter(formatter: LegacyMetadataFormatter): void {
    this.legacyMetadataFormatter = formatter;
  }

  getEntityRepository(): EntityRepository {
    if (!this.entityRepository) {
      throw new Error('EntityRepository not registered');
    }
    return this.entityRepository;
  }

  getEntityCompositionService(): EntityCompositionService {
    if (!this.entityCompositionService) {
      this.entityCompositionService = new EntityCompositionServiceImpl(
        this.getEntityRepository(),
        this.getLegacyMetadataFormatter()
      );
    }
    return this.entityCompositionService!;
  }

  getLegacyMetadataFormatter(): LegacyMetadataFormatter {
    if (!this.legacyMetadataFormatter) {
      this.legacyMetadataFormatter = new LegacyMetadataFormatterImpl();
    }
    return this.legacyMetadataFormatter;
  }

  getEntityCompositionUseCase(): EntityCompositionUseCase {
    if (!this.entityCompositionUseCase) {
      this.entityCompositionUseCase = new EntityCompositionUseCaseImpl(
        this.getEntityRepository(),
        this.getEntityCompositionService(),
        this.getLegacyMetadataFormatter()
      );
    }
    return this.entityCompositionUseCase;
  }

  reset(): void {
    this.entityRepository = null;
    this.entityCompositionService = null;
    this.legacyMetadataFormatter = null;
    this.entityCompositionUseCase = null;
  }
}
