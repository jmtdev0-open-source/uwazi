/**
 * Entity Composition React Hooks
 * React hooks for entity composition with legacy pattern integration
 */
import React, { useState, useCallback, useContext, createContext } from 'react';
import { EntityCompositionUseCase } from '../../application/use-cases/EntityCompositionUseCase';
import { EntityComposer } from '../../core/EntityComposer';
import { CompositionOptions, ComposedEntity, PerformanceMetrics } from '../../types';

// Context for dependency injection
const EntityCompositionContext = createContext<{
  useCase: EntityCompositionUseCase;
  composer: EntityComposer;
} | null>(null);

export const EntityCompositionProvider: React.FC<{
  children: React.ReactNode;
  useCase: EntityCompositionUseCase;
  composer: EntityComposer;
}> = ({ children, useCase, composer }) => {
  return React.createElement(
    EntityCompositionContext.Provider,
    { value: { useCase, composer } },
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
    ): Promise<ComposedEntity | null> => {
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
    ): Promise<ComposedEntity[]> => {
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
  const composer = context.composer;

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fluentForEntity = useCallback(
    (entityId: string) => {
      return composer.fluentForEntity(entityId);
    },
    [composer]
  );

  const fluentForEntities = useCallback(
    (entityIds: string[]) => {
      return composer.fluentForEntities(entityIds);
    },
    [composer]
  );

  return {
    fluentForEntity,
    fluentForEntities,
    loading,
    error,
    clearError: () => setError(null),
  };
};

// Performance tracking hook
export const useEntityCompositionWithPerformance = (useCase?: EntityCompositionUseCase) => {
  const context = useEntityCompositionContext();
  const actualUseCase = useCase || context.useCase;
  const composer = context.composer;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  const composeEntity = useCallback(
    async (
      entityId: string,
      options: CompositionOptions,
      _userContext: { userId?: string; userPermissions?: string[] } = {}
    ): Promise<ComposedEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await actualUseCase.composeEntity(entityId, options, _userContext);
        if (result.success) {
          setPerformance(result.performance);
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

  const getPerformanceStats = useCallback(() => {
    return composer.getPerformanceStats();
  }, [composer]);

  return {
    composeEntity,
    loading,
    error,
    performance,
    getPerformanceStats,
    clearError: () => setError(null),
  };
};

// Caching hook
export const useEntityCompositionWithCaching = (useCase?: EntityCompositionUseCase) => {
  const context = useEntityCompositionContext();
  const actualUseCase = useCase || context.useCase;
  const composer = context.composer;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<{
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
    totalRequests: number;
  } | null>(null);

  const composeEntity = useCallback(
    async (
      entityId: string,
      options: CompositionOptions,
      _userContext: { userId?: string; userPermissions?: string[] } = {}
    ): Promise<ComposedEntity | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await actualUseCase.composeEntity(entityId, options, _userContext);
        if (result.success) {
          setCacheStats(composer.getCacheStats());
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
    [actualUseCase, composer]
  );

  const getCacheStats = useCallback(() => {
    return composer.getCacheStats();
  }, [composer]);

  return {
    composeEntity,
    loading,
    error,
    cacheStats,
    getCacheStats,
    clearError: () => setError(null),
  };
};

// Legacy formatting hook
export const useLegacyEntityComposition = (useCase?: EntityCompositionUseCase) => {
  const context = useEntityCompositionContext();
  const actualUseCase = useCase || context.useCase;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLegacyFormattedData = useCallback(
    async (entityId: string) => {
      setLoading(true);
      setError(null);

      try {
        return await actualUseCase.getLegacyFormattedData(entityId);
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

  const getFormattedMetadata = useCallback(
    async (entityId: string, propertyName: string) => {
      setLoading(true);
      setError(null);

      try {
        return await actualUseCase.getFormattedMetadata(entityId, propertyName);
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

  const getFormattedRelationships = useCallback(
    async (entityId: string) => {
      setLoading(true);
      setError(null);

      try {
        return await actualUseCase.getFormattedRelationships(entityId);
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

  const getFormattedFiles = useCallback(
    async (entityId: string) => {
      setLoading(true);
      setError(null);

      try {
        return await actualUseCase.getFormattedFiles(entityId);
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

  const getFormattedNavigation = useCallback(
    async (entityId: string) => {
      setLoading(true);
      setError(null);

      try {
        return await actualUseCase.getFormattedNavigation(entityId);
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

  return {
    getLegacyFormattedData,
    getFormattedMetadata,
    getFormattedRelationships,
    getFormattedFiles,
    getFormattedNavigation,
    loading,
    error,
    clearError: () => setError(null),
  };
};
