import React from 'react';
import { useLoaderData } from 'react-router';
import { Entity } from '../../domain/entities/Entity';

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

  if (!entity) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error: No entity data received</h1>
        <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      </div>
    );
  }

  console.log('Compositions received:', compositions);

  const renderComposition = (title: string, entity1: Entity | null, color: string) => (
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

      {entity1 ? (
        <pre
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '16px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#333',
            maxHeight: '50vh',
          }}
        >
          {JSON.stringify(entity, null, 2)}
        </pre>
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
            <strong>Template:</strong> {entity.template || 'None'}
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

      {renderComposition('1. Full Entity Composition (All Fields)', compositions.full, '#0066cc')}

      {renderComposition(
        '2. Date Fields Only (date, daterange)',
        compositions.dateFields,
        '#28a745'
      )}

      {renderComposition(
        '3. Select Fields Only (select, multiselect, relationship)',
        compositions.selectFields,
        '#dc3545'
      )}
    </div>
  );
}
