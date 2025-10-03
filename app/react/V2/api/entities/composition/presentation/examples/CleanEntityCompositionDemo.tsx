/**
 * Clean Entity Composition Demo
 * Uses only real API client - no mock data
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EntityCompositionProvider } from '../hooks/useEntityComposition';
import { EntityComposer } from '../../core/EntityComposer';
import { EntityRepositoryImpl } from '../../infrastructure/repositories/EntityRepositoryImpl';
import { DependencyContainer } from '../../application/container/DependencyContainer';
import { ComposedEntity } from '../../types';
import { useEntityComposition } from '../hooks/useEntityComposition';

// Component that uses the hook within the provider
const EntityCompositionContent: React.FC<{ sharedId?: string }> = ({ sharedId }) => {
    const [entity, setEntity] = useState<ComposedEntity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { composeEntity } = useEntityComposition();

    // Helper function to render property value with proper formatting
    const renderPropertyValue = (property: any) => {
        if (!property) return null;

        // Handle formatted values from legacy formatter
        if (property.formattedValue) {
            if (typeof property.formattedValue === 'object' && property.formattedValue.value) {
                // Select field with formatted value
                return String(property.formattedValue.value);
            }
            if (Array.isArray(property.formattedValue)) {
                // Multi-select field
                return property.formattedValue.map((item: any) =>
                    typeof item === 'object' ? (item.value || item.label || String(item)) : String(item)
                ).join(', ');
            }
            return String(property.formattedValue);
        }

        // Handle display value
        if (property.displayValue) {
            return String(property.displayValue);
        }

        // Handle direct value
        if (property.value !== undefined) {
            return String(property.value);
        }

        // Fallback
        return String(property.label || property.name || 'Unknown');
    };

    // Helper function to get property label
    const getPropertyLabel = (key: string) => {
        // Convert camelCase to readable format
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const loadEntity = async () => {
        setLoading(true);
        setError(null);
        try {
            const entityId = sharedId || 'demo-entity-123';
            console.log('=== LOADING ENTITY ===');
            console.log('Entity ID:', entityId);
            console.log('Shared ID:', sharedId);

            const composedEntity = await composeEntity(entityId, {
                includeTemplate: true,
                includeProperties: true,
                includeMetadata: true,
                includeRelationships: true,
                includeFiles: true,
                includeNavigation: true,
                includePermissions: true
            }, { userId: 'demo-user', userPermissions: ['read', 'write'] });

            console.log('Composed entity result:', composedEntity);
            setEntity(composedEntity);
        } catch (err) {
            console.error('Error loading entity:', err);
            setError(err instanceof Error ? err.message : 'Failed to load entity');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntity();
    }, [sharedId]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #0066cc',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '16px', color: '#666' }}>Loading entity...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2>Error Loading Entity</h2>
                <p>{error}</p>
                <button
                    onClick={loadEntity}
                    style={{
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Navigation Bar */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e0e0e0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '8px'
                    }}>←</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                            backgroundColor: '#0066cc',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>Metadata</button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>Document</button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>Relationships</button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>Files</button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Title */}
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '32px',
                    lineHeight: '1.3'
                }}>
                    {entity?.title || 'Loading...'}
                </h1>

                {entity && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Left Column */}
                        <div>
                            {/* Document Section */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '24px',
                                marginBottom: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '16px'
                                }}>Document</h2>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '4px',
                                    padding: '16px',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                        {entity.title}
                                    </div>
                                    <div style={{ color: '#666', marginBottom: '12px' }}>
                                        {entity.metadata.country || 'Unknown'} • {entity.metadata.date || 'Unknown Date'}
                                    </div>
                                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                        {entity.metadata.description ?
                                            entity.metadata.description.substring(0, 200) + '...' :
                                            'No description available'
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Files Section */}
                            {entity.files.documents.length > 0 && (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    marginBottom: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '16px'
                                    }}>Files</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {entity.files.documents.map((file, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px'
                                            }}>
                                                <span style={{
                                                    backgroundColor: '#0066cc',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: '500'
                                                }}>{file.type}</span>
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: '#0066cc',
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer',
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>{file.filename}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Properties */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '24px',
                                marginBottom: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '16px'
                                }}>Properties</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {entity.metadata && Object.entries(entity.metadata).map(([key, value]) => {
                                        const displayValue = renderPropertyValue(value);

                                        if (!displayValue || displayValue === 'null' || displayValue === 'undefined') {
                                            return null;
                                        }

                                        return (
                                            <div key={key}>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                                    {getPropertyLabel(key)}
                                                </div>
                                                <div style={{ fontSize: '14px' }}>
                                                    {String(displayValue)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    marginTop: '32px',
                    padding: '16px 0',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{
                            backgroundColor: '#0066cc',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}>Edit</button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: '1px solid #ccc',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}>Share</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Entity Composition Demo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CleanEntityCompositionDemo: React.FC = () => {
    const { sharedId } = useParams<{ sharedId?: string }>();
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Setup dependency injection
            const container = DependencyContainer.getInstance();

            // Create real API client (no mock data)
            const apiClient = {
                get: async (url: string, config?: any) => {
                    console.log('API GET:', url, config);
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        ...config
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return { data: await response.json() };
                },
                post: async (url: string, data?: any) => {
                    console.log('API POST:', url, data);
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return { data: await response.json() };
                },
                put: async (url: string, data?: any) => {
                    console.log('API PUT:', url, data);
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return { data: await response.json() };
                },
                delete: async (url: string) => {
                    console.log('API DELETE:', url);
                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    return { status: response.status };
                },
                head: async (url: string) => {
                    console.log('API HEAD:', url);
                    const response = await fetch(url, {
                        method: 'HEAD',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    return { status: response.status };
                }
            };

            // Register dependencies
            container.setEntityRepository(new EntityRepositoryImpl(apiClient));

            // Create use case and composer
            const useCase = container.getEntityCompositionUseCase();
            const composer = new EntityComposer(useCase);

            // Store in global for the example component
            (window as any).entityCompositionUseCase = useCase;
            (window as any).entityCompositionComposer = composer;

            setIsReady(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to setup composition system');
        }
    }, [sharedId]);

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Entity Composition Demo - Setup Error</h1>
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Entity Composition Demo - Loading...</h1>
                <p>Setting up the composition system...</p>
            </div>
        );
    }

    const useCase = (window as any).entityCompositionUseCase;
    const composer = (window as any).entityCompositionComposer;

    return (
        <EntityCompositionProvider useCase={useCase} composer={composer}>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
            <EntityCompositionContent sharedId={sharedId} />
        </EntityCompositionProvider>
    );
};

export default CleanEntityCompositionDemo;
