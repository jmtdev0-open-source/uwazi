import { CompositionServiceFactory } from '../services/CompositionServiceFactory';
import { EntityRepositoryImpl } from 'app/V2/infrastructure';

let _entityCompositionUseCase: any = null;
let _initializationPromise: Promise<any> | null = null;

export const getEntityCompositionUseCase = async (): Promise<any> => {
  if (_entityCompositionUseCase) {
    return _entityCompositionUseCase;
  }

  if (_initializationPromise) {
    return _initializationPromise;
  }

  _initializationPromise = CompositionServiceFactory.createCompositionService(
    new EntityRepositoryImpl()
  );
  return _initializationPromise;
};

export const resetEntityCompositionUseCase = (): void => {
  _entityCompositionUseCase = null;
  _initializationPromise = null;
};
