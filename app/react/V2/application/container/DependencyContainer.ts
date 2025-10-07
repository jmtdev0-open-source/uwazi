/**
 * Dependency Injection Container
 * Manages dependencies between layers
 */
import { EntityRepository } from '../../infrastructure/repositories/EntityRepository';
import { EntityFormatter, EntityFormatterImpl } from '../services/EntityFormatter';
import { PropertyValueBuilder } from '../services/PropertyValueBuilder';
import { EntityCompositionUseCase } from '../useCases/EntityCompositionUseCase';
import { EntityCompositionUseCaseImpl } from '../useCases/EntityCompositionUseCase';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private entityRepository: EntityRepository | null = null;
  private propertyValueBuilder: PropertyValueBuilder | null = null;
  private entityFormatter: EntityFormatter | null = null;
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

  setPropertyValueBuilder(builder: PropertyValueBuilder): void {
    this.propertyValueBuilder = builder;
  }

  setEntityFormatter(formatter: EntityFormatter): void {
    this.entityFormatter = formatter;
  }

  getEntityRepository(): EntityRepository {
    if (!this.entityRepository) {
      throw new Error('EntityRepository not registered');
    }
    return this.entityRepository;
  }

  getPropertyValueBuilder(): PropertyValueBuilder {
    if (!this.propertyValueBuilder) {
      this.propertyValueBuilder = new PropertyValueBuilder();
    }
    return this.propertyValueBuilder;
  }

  getEntityFormatter(): EntityFormatter {
    if (!this.entityFormatter) {
      this.entityFormatter = new EntityFormatterImpl(this.getPropertyValueBuilder());
    }
    return this.entityFormatter;
  }

  getEntityCompositionUseCase(): EntityCompositionUseCase {
    if (!this.entityCompositionUseCase) {
      this.entityCompositionUseCase = new EntityCompositionUseCaseImpl(
        this.getEntityRepository(),
        this.getPropertyValueBuilder(),
        this.getEntityFormatter()
      );
    }
    return this.entityCompositionUseCase;
  }

  reset(): void {
    this.entityRepository = null;
    this.propertyValueBuilder = null;
    this.entityCompositionUseCase = null;
    this.entityFormatter = null;
  }
}
