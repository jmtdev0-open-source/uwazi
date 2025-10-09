import { CompositionServiceFactory } from '../services/CompositionServiceFactory';
import * as entitiesApi from '../../api/entities/index';

let _entityCompositionUseCase: any = null;
let _initializationPromise: Promise<any> | null = null;

export const getEntityCompositionUseCase = async (): Promise<any> => {
  if (_entityCompositionUseCase) {
    return _entityCompositionUseCase;
  }

  if (_initializationPromise) {
    return _initializationPromise;
  }

  _initializationPromise = CompositionServiceFactory.createCompositionService(entitiesApi);
  return _initializationPromise;
};

export const resetEntityCompositionUseCase = (): void => {
  _entityCompositionUseCase = null;
  _initializationPromise = null;
};
