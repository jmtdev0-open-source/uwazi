import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { Entity } from '../../domain/entities/Entity';
import { useEntityComposition, EntityCompositionProvider } from '../hooks/useEntityComposition';
import { EntityComposer } from '../../core/EntityComposer';
import { CompositionServiceFactory } from '../../application/services/CompositionServiceFactory';
import * as entitiesApi from '../../../index';

export default function EntityPreviewWithLoader() {
  const loaderData = useLoaderData();
  console.log('Loader data received:', loaderData);

  const { entity, compositions, performance } = loaderData as {
    entity: any;
    compositions: {
      full: Entity | null;
      dateFields: Entity | null;
      selectFields: Entity | null;
    };
    performance: {
      compositionTime: number;
      resolutionTime: number;
      cacheHits: number;
      cacheMisses: number;
    };
  };

  // Provider wiring for hook usage
  const [providerReady, setProviderReady] = useState(false);
  const [useCase, setUseCase] = useState<any>(null);
  const [composer, setComposer] = useState<EntityComposer | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const uc = await CompositionServiceFactory.createCompositionService(entitiesApi);
        if (!mounted) return;
        setUseCase(uc);
        setComposer(new EntityComposer(uc));
        setProviderReady(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to init EntityCompositionProvider', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // NOTE: Hook usage moved into child component rendered within the Provider

  if (!entity) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error: No entity data received</h1>
        <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      </div>
    );
  }

  // console.log('Compositions received:', compositions);

  const renderComposition = (title: string, entity1: Entity | null, color: string, loading?: boolean, error?: string | null, performanceData?: any) => (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: color,
          marginBottom: '16px',
          borderBottom: `2px solid ${color}`,
          paddingBottom: '8px',
        }}
      >
        {title}
      </h2>

      {loading ? (
        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : entity1 ? (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            <strong>Template:</strong> {entity1.template?.name || 'None'} |
            <strong> Filtered Metadata Fields:</strong> {Object.keys(entity1.metadata || {}).length} fields
            {performanceData && (
              <span style={{ marginLeft: '16px', color: '#28a745' }}>
                <strong>Hook Performance:</strong> {performanceData.duration.toFixed(2)}ms
              </span>
            )}
          </div>

          {/* Show filtered metadata fields */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              Filtered Fields:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {Object.keys(entity1.metadata || {}).map(fieldName => (
                <span
                  key={fieldName}
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {fieldName}
                </span>
              ))}
            </div>
          </div>

          {/* Show selective raw data and formatted data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Selective Raw Data:
              </h4>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '12px',
                  overflow: 'auto',
                  fontSize: '11px',
                  lineHeight: '1.3',
                  color: '#333',
                  maxHeight: '40vh',
                }}
              >
                {JSON.stringify(entity1.rawData, null, 2)}
              </pre>
            </div>

          </div>
        </div>
      ) : (
        <div style={{ color: '#666', fontStyle: 'italic' }}>No data available</div>
      )}
    </div>
  );

  return (
    providerReady && useCase && composer ? (
      <EntityCompositionProvider useCase={useCase} composer={composer}>
        <EntityPreviewContent entity={entity} compositions={compositions} performance={performance} />
      </EntityCompositionProvider>
    ) : (
      <div style={{ padding: '20px' }}>Initializing composition context…</div>
    )
  );
}

function EntityPreviewContent({
  entity,
  compositions,
  performance,
}: {
  entity: any;
  compositions: { full: Entity | null; dateFields: Entity | null; selectFields: Entity | null };
  performance: { compositionTime: number; resolutionTime: number; cacheHits: number; cacheMisses: number };
}) {
  // Hook-based approach for date fields (now safely inside Provider)
  const [hookDateFields, setHookDateFields] = useState<Entity | null>(null);
  const [hookLoading, setHookLoading] = useState(false);
  const [hookError, setHookError] = useState<string | null>(null);
  const [hookPerformance, setHookPerformance] = useState<{
    startTime: number;
    endTime: number;
    duration: number;
  } | null>(null);

  const { composeEntity } = useEntityComposition();

  useEffect(() => {
    if (entity && entity.sharedId) {
      setHookLoading(true);
      setHookError(null);
      const startTime = window.performance.now();
      composeEntity(entity.sharedId, {
        includeTemplate: true,
        includeMetadata: true,
        includeRelationships: false,
        includeFiles: false,
        includeNavigation: false,
        fieldTypes: ['date', 'daterange', 'multidate'],
        dateFormat: 'YYYY-MM-DD',
        includePropertyMetadata: true,
      })
        .then(composedEntity => {
          const endTime = window.performance.now();
          setHookDateFields(composedEntity);
          setHookPerformance({ startTime, endTime, duration: endTime - startTime });
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('Hook-based composition failed:', error);
          setHookError(error.message || 'Failed to compose entity');
        })
        .finally(() => {
          setHookLoading(false);
        });
    }
  }, [entity, composeEntity]);
  // Local renderer for sections
  const renderComposition = (
    title: string,
    entity1: Entity | null,
    color: string,
    loading?: boolean,
    error?: string | null,
    performanceData?: any
  ) => (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: color,
          marginBottom: '16px',
          borderBottom: `2px solid ${color}`,
          paddingBottom: '8px',
        }}
      >
        {title}
      </h2>

      {loading ? (
        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : entity1 ? (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            <strong>Template:</strong> {entity1.template?.name || 'None'} |
            <strong> Filtered Metadata Fields:</strong> {Object.keys(entity1.metadata || {}).length} fields
            {performanceData && (
              <span style={{ marginLeft: '16px', color: '#28a745' }}>
                <strong>Hook Performance:</strong> {performanceData.duration.toFixed(2)}ms
              </span>
            )}
          </div>

          {/* Show filtered metadata fields */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              Filtered Fields:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {Object.keys(entity1.metadata || {}).map(fieldName => (
                <span
                  key={fieldName}
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {fieldName}
                </span>
              ))}
            </div>
          </div>

          {/* Show selective raw data and formatted data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Selective Raw Data:
              </h4>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  padding: '12px',
                  overflow: 'auto',
                  fontSize: '11px',
                  lineHeight: '1.3',
                  color: '#333',
                  maxHeight: '40vh',
                }}
              >
                {JSON.stringify(entity1.rawData, null, 2)}
              </pre>
            </div>

          </div>
        </div>
      ) : (
        <div style={{ color: '#666', fontStyle: 'italic' }}>No data available</div>
      )}
    </div>
  );

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'monospace',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '16px',
            borderBottom: '2px solid #0066cc',
            paddingBottom: '8px',
          }}
        >
          Entity Composition Demo
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          <div>
            <strong>Entity ID:</strong> {entity._id}
          </div>
          <div>
            <strong>Shared ID:</strong> {entity.sharedId}
          </div>
          <div>
            <strong>Title:</strong> {entity.title}
          </div>
          <div>
            <strong>Template:</strong> {entity.template?.name || 'None'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <div>
            <strong>Composition Time:</strong> {performance.compositionTime}ms
          </div>
          <div>
            <strong>Resolution Time:</strong> {performance.resolutionTime}ms
          </div>
          <div>
            <strong>Cache Hits:</strong> {performance.cacheHits}
          </div>
          <div>
            <strong>Cache Misses:</strong> {performance.cacheMisses}
          </div>
        </div>
      </div>

      {renderComposition('1. Full Entity Composition (All Fields) - Loader', compositions.full, '#0066cc')}

      {renderComposition(
        '2. Date Fields Only (date, daterange, multidate) - Loader',
        compositions.dateFields,
        '#28a745'
      )}

      {renderComposition(
        '3. Date Fields Only (date, daterange, multidate) - Hook',
        hookDateFields,
        '#17a2b8',
        hookLoading,
        hookError,
        hookPerformance
      )}

      {renderComposition(
        '4. Select Fields Only (select, multiselect, relationship) - Loader',
        compositions.selectFields,
        '#dc3545'
      )}

      {/* Comparison Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#6c757d',
            marginBottom: '16px',
            borderBottom: '2px solid #6c757d',
            paddingBottom: '8px',
          }}
        >
          🔄 Loader vs Hook Comparison
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#28a745', marginBottom: '12px' }}>Loader Approach</h3>
            <ul style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
              <li>✅ Data fetched before component renders</li>
              <li>✅ No loading states in component</li>
              <li>✅ Better for SEO and initial page load</li>
              <li>✅ Automatic error handling at route level</li>
              <li>❌ Less flexible for dynamic updates</li>
              <li>❌ Requires route configuration</li>
            </ul>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#28a745' }}>
              <strong>Performance:</strong> {performance.compositionTime}ms
            </div>
          </div>

          <div>
            <h3 style={{ color: '#17a2b8', marginBottom: '12px' }}>Hook Approach</h3>
            <ul style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
              <li>✅ More flexible and dynamic</li>
              <li>✅ Can be triggered by user actions</li>
              <li>✅ Better for conditional data fetching</li>
              <li>✅ Reusable across components</li>
              <li>❌ Requires loading state management</li>
              <li>❌ Potential for multiple API calls</li>
            </ul>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#17a2b8' }}>
              <strong>Performance:</strong> {hookPerformance ? `${hookPerformance.duration.toFixed(2)}ms` : 'Not measured'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
