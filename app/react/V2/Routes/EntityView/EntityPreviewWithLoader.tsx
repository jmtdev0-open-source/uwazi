import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import {
  useEntityComposition,
  EntityCompositionProvider,
} from '../../CustomHooks/useEntityComposition';
import { CompositionServiceFactory } from 'app/V2/application';
import { dateFieldsOptions } from 'app/V2/application/optionsPresets';
import * as entitiesApi from '../../api/entities/index';
import { Entity } from 'app/V2/domain/entities/Entity';

const EntityPreviewContent = ({
  compositions,
}: {
  compositions: { full: Entity | null; dateFields: Entity | null; selectFields: Entity | null };
}) => {
  const [hookDateFields, setHookDateFields] = useState<Entity | null>(null);
  const [hookLoading, setHookLoading] = useState(false);
  const [hookError, setHookError] = useState<string | null>(null);

  const { composeEntity } = useEntityComposition();

  useEffect(() => {
    if (compositions.full && compositions.full.sharedId) {
      setHookLoading(true);
      setHookError(null);
      composeEntity(compositions.full.sharedId, dateFieldsOptions('YYYY-MM-DD'))
        .then(composedEntity => {
          setHookDateFields(composedEntity);
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
  }, [composeEntity, compositions.full]);

  const renderComposition = (
    title: string,
    entity: Entity | null,
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

      {loading && (
        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          Loading...
        </div>
      )}
      {!loading && error && (
        <div
          style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      {!loading && !error && entity && (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            <strong>Template:</strong> {entity.template?.name || 'None'} |
            <strong> Filtered Metadata Fields:</strong> {Object.keys(entity.metadata || {}).length}{' '}
            fields
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
              {Object.keys(entity.metadata || {}).map(fieldName => (
                <span
                  key={fieldName}
                  style={{
                    backgroundColor: color,
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
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
              <h4
                style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}
              >
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
                {JSON.stringify(entity, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && entity && (
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
            <strong>Entity ID:</strong> {compositions.full?._id}
          </div>
          <div>
            <strong>Shared ID:</strong> {compositions.full?.sharedId}
          </div>
          <div>
            <strong>Title:</strong> {compositions.full?.title}
          </div>
          <div>
            <strong>Template:</strong> {compositions.full?.template?.name || 'None'}
          </div>
        </div>
      </div>

      {renderComposition(
        '1. Full Entity Composition (All Fields) - Loader',
        compositions.full,
        '#0066cc'
      )}

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
        hookError
      )}

      {renderComposition(
        '4. Select Fields Only (select, multiselect, relationship) - Loader',
        compositions.selectFields,
        '#dc3545'
      )}
    </div>
  );
};

const EntityPreviewWithLoader = () => {
  const loaderData = useLoaderData();

  const { full, dateFields, selectFields } = loaderData as {
    full: Entity | null;
    dateFields: Entity | null;
    selectFields: Entity | null;
  };

  const [providerReady, setProviderReady] = useState(false);
  const [useCase, setUseCase] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const initializeService = async () => {
      try {
        const uc = await CompositionServiceFactory.createCompositionService(entitiesApi);
        if (!mounted) return;
        setUseCase(uc);
        setProviderReady(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to init EntityCompositionProvider', e);
      }
    };

    initializeService().catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  if (!full) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error: No entity data received</h1>
        <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      </div>
    );
  }
  return providerReady && useCase ? (
    <EntityCompositionProvider useCase={useCase}>
      <EntityPreviewContent compositions={{ full, dateFields, selectFields }} />
    </EntityCompositionProvider>
  ) : (
    <div style={{ padding: '20px' }}>Initializing composition context…</div>
  );
};

export default EntityPreviewWithLoader;
