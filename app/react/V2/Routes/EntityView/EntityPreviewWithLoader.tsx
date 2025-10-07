import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import {
  useEntityComposition,
  EntityCompositionProvider,
} from '../../CustomHooks/useEntityComposition';
import { EntityComposer } from '../../application/EntityComposer';
import { CompositionServiceFactory } from 'app/V2/application';
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
      composeEntity(compositions.full.sharedId, {
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

      {loading ? (
        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          Loading...
        </div>
      ) : error ? (
        <div
          style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}
        >
          <strong>Error:</strong> {error}
        </div>
      ) : entity ? (
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
                {JSON.stringify(entity.rawData, null, 2)}
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

export default function EntityPreviewWithLoader() {
  const loaderData = useLoaderData();

  const { full, dateFields, selectFields } = loaderData as {
    full: Entity | null;
    dateFields: Entity | null;
    selectFields: Entity | null;
  };

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

  if (!full) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error: No entity data received</h1>
        <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      </div>
    );
  }

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
        <div
          style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}
        >
          <strong>Error:</strong> {error}
        </div>
      ) : entity1 ? (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            <strong>Template:</strong> {entity1.template?.name || 'None'} |
            <strong> Filtered Metadata Fields:</strong> {Object.keys(entity1.metadata || {}).length}{' '}
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
              {Object.keys(entity1.metadata || {}).map(fieldName => (
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

  return providerReady && useCase && composer ? (
    <EntityCompositionProvider useCase={useCase} composer={composer}>
      <EntityPreviewContent compositions={{ full, dateFields, selectFields }} />
    </EntityCompositionProvider>
  ) : (
    <div style={{ padding: '20px' }}>Initializing composition context…</div>
  );
}
