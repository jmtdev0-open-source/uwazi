import React from 'react';
import { useLoaderData } from 'react-router';
import { ComposedEntity } from '../../types';

/**
 * Entity Preview with Loader
 * 
 * Minimal component that reuses existing entity composition logic
 * but receives pre-loaded data from React Router loader.
 * This reduces code duplication and follows React Router v7 patterns.
 */
export default function EntityPreviewWithLoader() {
    const loaderData = useLoaderData();
    console.log('Loader data received:', loaderData);

    const { entity, performance } = loaderData as {
        entity: ComposedEntity;
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

    return (
        <div style={{
            padding: '20px',
            fontFamily: 'monospace',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                    borderBottom: '2px solid #0066cc',
                    paddingBottom: '8px'
                }}>
                    Entity Preview (with Loader)
                </h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <div>
                        <strong>Entity ID:</strong> {entity.id}
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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: '#666'
                }}>
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

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '8px'
                }}>
                    Formatted Entity Data
                </h2>

                <pre style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    padding: '16px',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    color: '#333',
                    maxHeight: '70vh'
                }}>
                    {JSON.stringify(entity, null, 2)}
                </pre>
            </div>
        </div>
    );
}
