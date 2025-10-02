/**
 * Unified Entity Composition Example
 * Demonstrates the unified solution with all features
 */
import React, { useState } from 'react';
import { EntityCompositionProvider } from '../hooks/useEntityComposition';
import {
  useEntityComposition,
  useFluentEntityComposition,
  useEntityCompositionWithPerformance,
  useEntityCompositionWithCaching,
  useLegacyEntityComposition,
} from '../hooks/useEntityComposition';
import { EntityCompositionUseCase } from '../../application/use-cases/EntityCompositionUseCase';
import { EntityComposer } from '../../core/EntityComposer';
import { ComposedEntity } from '../../types';

interface UnifiedEntityCompositionExampleProps {
  useCase: EntityCompositionUseCase;
  composer: EntityComposer;
}

const UnifiedEntityCompositionExample: React.FC<UnifiedEntityCompositionExampleProps> = ({
  useCase,
  composer,
}) => {
  const [entityId, setEntityId] = useState('entity-123');
  const [entityIds, setEntityIds] = useState(['entity-123', 'entity-456']);
  const [userId, setUserId] = useState('user-123');
  const [userPermissions, setUserPermissions] = useState(['read', 'write']);

  // Basic composition hook
  const {
    composeEntity,
    composeEntities,
    loading: basicLoading,
    error: basicError,
  } = useEntityComposition(useCase);

  // Fluent API hook
  const {
    fluentForEntity,
    loading: fluentLoading,
    error: fluentError,
  } = useFluentEntityComposition(useCase);

  // Performance tracking hook
  const {
    composeEntity: composeEntityWithPerformance,
    loading: performanceLoading,
    error: performanceError,
    performance,
  } = useEntityCompositionWithPerformance(useCase);

  // Caching hook
  const {
    composeEntity: composeEntityWithCaching,
    loading: cachingLoading,
    error: cachingError,
    cacheStats,
  } = useEntityCompositionWithCaching(useCase);

  // Legacy formatting hook
  const {
    getLegacyFormattedData,
    loading: legacyLoading,
    error: legacyError,
  } = useLegacyEntityComposition(useCase);

  const [composedEntity, setComposedEntity] = useState<ComposedEntity | null>(null);
  const [composedEntities, setComposedEntities] = useState<ComposedEntity[]>([]);
  const [legacyData, setLegacyData] = useState<any>(null);

  // Basic composition example
  const handleBasicComposition = async () => {
    const entity = await composeEntity(
      entityId,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: true,
        includeFiles: true,
        includeNavigation: true,
        includePermissions: true,
      },
      { userId, userPermissions }
    );

    setComposedEntity(entity);
  };

  // Fluent API example
  const handleFluentComposition = async () => {
    const builder = fluentForEntity(entityId)
      .withTemplate()
      .withMetadata()
      .withRelationships()
      .forDetailView()
      .forUser(userId, userPermissions);

    const entity = await builder.getEntity();
    setComposedEntity(entity);
  };

  // Performance tracking example
  const handlePerformanceComposition = async () => {
    const entity = await composeEntityWithPerformance(
      entityId,
      {
        includeTemplate: true,
        includeMetadata: true,
        includeRelationships: true,
      },
      { userId, userPermissions }
    );

    setComposedEntity(entity);
  };

  // Caching example
  const handleCachingComposition = async () => {
    const entity = await composeEntityWithCaching(
      entityId,
      {
        includeTemplate: true,
        includeMetadata: true,
      },
      { userId, userPermissions }
    );

    setComposedEntity(entity);
  };

  // Legacy formatting example
  const handleLegacyFormatting = async () => {
    const data = await getLegacyFormattedData(entityId);
    setLegacyData(data);
  };

  // Batch composition example
  const handleBatchComposition = async () => {
    const entities = await composeEntities(
      entityIds,
      {
        includeTemplate: true,
        includeProperties: true,
        includeMetadata: true,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        includePermissions: true,
      },
      { userId, userPermissions }
    );

    setComposedEntities(entities);
  };

  // View-specific composition examples
  const handleListViewComposition = async () => {
    const entities = await composer.composeEntitiesForListView(entityIds, {
      userId,
      userPermissions,
    });
    setComposedEntities(entities.entities);
  };

  const handleCardViewComposition = async () => {
    const entities = await composer.composeEntitiesForCardView(entityIds, {
      userId,
      userPermissions,
    });
    setComposedEntities(entities.entities);
  };

  const handleDetailViewComposition = async () => {
    const entities = await composer.composeEntitiesForDetailView(entityIds, {
      userId,
      userPermissions,
    });
    setComposedEntities(entities.entities);
  };

  const handleFormViewComposition = async () => {
    const entities = await composer.composeEntitiesForFormView(entityIds, {
      userId,
      userPermissions,
    });
    setComposedEntities(entities.entities);
  };

  return (
    <EntityCompositionProvider useCase={useCase} composer={composer}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Unified Entity Composition Example</h1>

        <div style={{ marginBottom: '20px' }}>
          <h2>Configuration</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Entity ID"
              value={entityId}
              onChange={e => setEntityId(e.target.value)}
              style={{ padding: '5px' }}
            />
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              style={{ padding: '5px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Entity IDs (comma separated)"
              value={entityIds.join(',')}
              onChange={e => setEntityIds(e.target.value.split(','))}
              style={{ padding: '5px', width: '300px' }}
            />
            <input
              type="text"
              placeholder="User Permissions (comma separated)"
              value={userPermissions.join(',')}
              onChange={e => setUserPermissions(e.target.value.split(','))}
              style={{ padding: '5px', width: '300px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Basic Composition</h2>
          <button onClick={handleBasicComposition} disabled={basicLoading}>
            {basicLoading ? 'Loading...' : 'Compose Entity'}
          </button>
          {basicError && <div style={{ color: 'red' }}>Error: {basicError}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Fluent API</h2>
          <button onClick={handleFluentComposition} disabled={fluentLoading}>
            {fluentLoading ? 'Loading...' : 'Fluent Composition'}
          </button>
          {fluentError && <div style={{ color: 'red' }}>Error: {fluentError}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Performance Tracking</h2>
          <button onClick={handlePerformanceComposition} disabled={performanceLoading}>
            {performanceLoading ? 'Loading...' : 'Compose with Performance'}
          </button>
          {performanceError && <div style={{ color: 'red' }}>Error: {performanceError}</div>}
          {performance && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
              <h3>Performance Metrics</h3>
              <p>Composition Time: {performance.compositionTime}ms</p>
              <p>Resolution Time: {performance.resolutionTime}ms</p>
              <p>Cache Hits: {performance.cacheHits}</p>
              <p>Cache Misses: {performance.cacheMisses}</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Caching</h2>
          <button onClick={handleCachingComposition} disabled={cachingLoading}>
            {cachingLoading ? 'Loading...' : 'Compose with Caching'}
          </button>
          {cachingError && <div style={{ color: 'red' }}>Error: {cachingError}</div>}
          {cacheStats && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
              <h3>Cache Statistics</h3>
              <p>Hits: {cacheStats.hits}</p>
              <p>Misses: {cacheStats.misses}</p>
              <p>Size: {cacheStats.size}</p>
              <p>Hit Rate: {cacheStats.hitRate}%</p>
              <p>Total Requests: {cacheStats.totalRequests}</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Legacy Formatting</h2>
          <button onClick={handleLegacyFormatting} disabled={legacyLoading}>
            {legacyLoading ? 'Loading...' : 'Get Legacy Formatted Data'}
          </button>
          {legacyError && <div style={{ color: 'red' }}>Error: {legacyError}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Batch Composition</h2>
          <button onClick={handleBatchComposition} disabled={basicLoading}>
            {basicLoading ? 'Loading...' : 'Compose Multiple Entities'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>View-Specific Composition</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button onClick={handleListViewComposition} disabled={basicLoading}>
              List View
            </button>
            <button onClick={handleCardViewComposition} disabled={basicLoading}>
              Card View
            </button>
            <button onClick={handleDetailViewComposition} disabled={basicLoading}>
              Detail View
            </button>
            <button onClick={handleFormViewComposition} disabled={basicLoading}>
              Form View
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Results</h2>
          {composedEntity && (
            <div style={{ padding: '10px', backgroundColor: '#e8f5e8', marginBottom: '10px' }}>
              <h3>Composed Entity</h3>
              <pre>{JSON.stringify(composedEntity, null, 2)}</pre>
            </div>
          )}

          {composedEntities.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#e8f5e8', marginBottom: '10px' }}>
              <h3>Composed Entities ({composedEntities.length})</h3>
              <pre>{JSON.stringify(composedEntities, null, 2)}</pre>
            </div>
          )}

          {legacyData && (
            <div style={{ padding: '10px', backgroundColor: '#e8f5e8' }}>
              <h3>Legacy Formatted Data</h3>
              <pre>{JSON.stringify(legacyData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </EntityCompositionProvider>
  );
};

export default UnifiedEntityCompositionExample;
