/**
 * Entity Composition React Hooks
 * React hooks for entity composition with legacy pattern integration
 */
import React, { useState, useCallback, useContext, createContext } from 'react';
import { EntityCompositionUseCase } from '../application/useCases/EntityCompositionUseCase';
import { CompositionOptions } from '../domain/entities/types';
import { Entity } from 'app/V2/domain/entities/Entity';

// Context for dependency injection
const EntityCompositionContext = createContext<{
  useCase: EntityCompositionUseCase;
} | null>(null);

export const EntityCompositionProvider: React.FC<{
  children: React.ReactNode;
  useCase: EntityCompositionUseCase;
}> = ({ children, useCase }) => {
  return React.createElement(
    EntityCompositionContext.Provider,
    { value: { useCase } },
    children
  );
};

// Hook to get the context
const useEntityCompositionContext = () => {
  const context = useContext(EntityCompositionContext);
  if (!context) {
    throw new Error('useEntityComposition must be used within EntityCompositionProvider');
  }
  return context;
};

// Basic entity composition hook
export const useEntityComposition = (useCase?: EntityCompositionUseCase) => {
  const context = useEntityCompositionContext();
  const actualUseCase = useCase || context.useCase;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composeEntity = useCallback(
    async (
      entityId: string,
      options: CompositionOptions,
      _userContext: { userId?: string; userPermissions?: string[] } = {}
    ): Promise<Entity | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await actualUseCase.composeEntity(entityId, options, _userContext);
        if (result.success) {
          return result.entity;
        }
        setError(result.error || 'Failed to compose entity');
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [actualUseCase]
  );

  const composeEntities = useCallback(
    async (
      entityIds: string[],
      options: CompositionOptions,
      _userContext: { userId?: string; userPermissions?: string[] } = {}
    ): Promise<Entity[]> => {
      setLoading(true);
      setError(null);

      try {
        const result = await actualUseCase.composeEntities(entityIds, options, _userContext);
        if (result.success) {
          return result.entities;
        }
        setError('Failed to compose entities');
        return [];
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [actualUseCase]
  );

  return {
    composeEntity,
    composeEntities,
    loading,
    error,
    clearError: () => setError(null),
  };
};

// Fluent API hook
export const useFluentEntityComposition = (_useCase?: EntityCompositionUseCase) => {
  const context = useEntityCompositionContext();
  const useCase = _useCase || context.useCase;

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fluentForEntity = useCallback(
    (entityId: string) => {
      return useCase.fluentForEntity(entityId);
    },
    [useCase]
  );

  const fluentForEntities = useCallback(
    (entityIds: string[]) => {
      return useCase.fluentForEntities(entityIds);
    },
    [useCase]
  );

  return {
    fluentForEntity,
    fluentForEntities,
    loading,
    error,
    clearError: () => setError(null),
  };
};
