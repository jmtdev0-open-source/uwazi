/**
 * Entity Composition Demo
 * Demo component that shows real entities with a UI matching the case entity design
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
                        }}>Relationships 14</button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>Files 4</button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>EN</button>
                    <button style={{
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>ES</button>
                    <button style={{
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>FR</button>
                    <button style={{
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>MY</button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Case Label */}
                <div style={{ marginBottom: '16px' }}>
                    <span style={{
                        backgroundColor: '#0066cc',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>Case</span>
                </div>

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
                                        {entity.metadata.country?.displayValue || 'Argentina'} • {entity.metadata.date?.displayValue || 'July 14, 2020'}
                                    </div>
                                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                        {entity.metadata.description?.displayValue?.substring(0, 200)}...
                                    </div>
                                </div>
                            </div>

                            {/* PDF Metadata */}
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
                                    }}>★ PDF Metadata</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Name</div>
                                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{entity.files.documents[0].filename}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Type</div>
                                            <div style={{ fontSize: '14px' }}>{entity.files.documents[0].type}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Last Edited</div>
                                            <div style={{ fontSize: '14px' }}>13-01-1986</div>
                                            <button style={{
                                                backgroundColor: '#0066cc',
                                                color: 'white',
                                                border: 'none',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                marginTop: '4px',
                                                cursor: 'pointer'
                                            }}>View</button>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Size</div>
                                            <div style={{ fontSize: '14px' }}>2.3 mb</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Added</div>
                                            <div style={{ fontSize: '14px' }}>23-11-2023</div>
                                            <button style={{
                                                backgroundColor: 'transparent',
                                                color: '#0066cc',
                                                border: '1px solid #0066cc',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                marginTop: '4px',
                                                cursor: 'pointer'
                                            }}>↓ Download</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
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
                                }}>Description</h2>
                                <div style={{
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: '#333'
                                }}>
                                    {entity.metadata.description?.displayValue}
                                </div>
                            </div>

                            {/* Geolocation */}
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
                                }}>Geolocation</h2>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '4px',
                                    height: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666'
                                }}>
                                    Map View (Buenos Aires, Argentina)
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Key-Value Pairs */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '24px',
                                marginBottom: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Country</div>
                                        <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🇦🇷</span>
                                            {entity.metadata.country?.displayValue}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Date</div>
                                        <div style={{ fontSize: '14px' }}>{entity.metadata.date?.displayValue}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Date of the incident</div>
                                        <div style={{ fontSize: '14px' }}>{entity.metadata.incidentDate?.displayValue}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Type</div>
                                        <div style={{ fontSize: '14px' }}>{entity.metadata.type?.displayValue}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mechanism</div>
                                        <div style={{ fontSize: '14px', textDecoration: 'underline', color: '#0066cc', cursor: 'pointer' }}>
                                            {entity.metadata.mechanism?.displayValue}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Signatories</div>
                                        <div style={{ fontSize: '14px', textDecoration: 'underline', color: '#0066cc', cursor: 'pointer' }}>
                                            {entity.metadata.signatories?.displayValue}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Files */}
                            {entity.files.attachments.length > 0 && (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '16px'
                                    }}>Other Files</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {entity.files.attachments.map((file, index) => (
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
                        <span style={{ fontSize: '12px', color: '#666' }}>Read mode (prototype only)</span>
                        <button style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EntityCompositionDemo: React.FC = () => {
    const { sharedId } = useParams<{ sharedId?: string }>();
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Setup dependency injection
            const container = DependencyContainer.getInstance();

            // Create API client that uses real API when sharedId is provided
            const apiClient = {
                get: async (url: string, config?: any) => {
                    console.log('=== API CLIENT DEBUG ===');
                    console.log('API GET:', url, config);
                    console.log('sharedId:', sharedId);
                    console.log('URL includes /entities/:', url.includes('/entities/'));
                    console.log('URL includes mock:', url.includes('mock'));
                    console.log('URL includes template:', url.includes('template'));
                    console.log('URL includes batch:', url.includes('batch'));
                    console.log('Full condition check:', {
                        hasSharedId: !!sharedId,
                        includesEntities: url.includes('/entities/'),
                        notMock: !url.includes('mock'),
                        notTemplate: !url.includes('template'),
                        notBatch: !url.includes('batch')
                    });

                    // If we have a sharedId and it's a real entity request, use the real API
                    if (sharedId && url.includes('/entities/') && !url.includes('mock') && !url.includes('template') && !url.includes('batch')) {
                        console.log('✅ CONDITIONS MET - Using real API');
                        try {
                            console.log('Attempting to fetch real entity with sharedId:', sharedId);
                            // Use the real Uwazi API with query parameters
                            const apiUrl = `/api/entities?sharedId=${sharedId}&omitRelationships=true&include=["permissions"]`;
                            console.log('API URL:', apiUrl);

                            const response = await fetch(apiUrl, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });

                            console.log('Response status:', response.status);
                            
                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('API Error Response:', errorText);
                                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                            }

                            const result = await response.json();
                            console.log('Real API response:', result);

                            // Uwazi returns { rows: [entity] } format
                            if (result.rows && result.rows.length > 0) {
                                console.log('Successfully fetched real entity:', result.rows[0]);
                                return { data: result.rows[0] };
                            } else {
                                console.log('No entities found in response');
                                throw new Error('Entity not found');
                            }
                        } catch (error) {
                            console.error('Real API call failed, falling back to mock:', error);
                            // Fall back to mock data if real API fails
                        }
                    }

                    // Return mock data based on URL
                    if (url.includes('/entities/')) {
                        console.log('🔄 FALLING BACK TO MOCK DATA');
                        const entityId = url.split('/entities/')[1];
                        console.log('Entity ID from URL:', entityId);
                        return {
                            data: {
                                _id: entityId,
                                sharedId: sharedId || `shared-${entityId}`,
                                title: sharedId ? 'REPORT No. 187/20 CASE 12.204 - ADMISSIBILITY AND MERITS - ACTIVE MEMORY CIVIL ASSOCIATION' : `Mock Entity ${entityId}`,
                                language: 'en',
                                template: {
                                    id: 'template-123',
                                    name: 'Case Template',
                                    properties: []
                                },
                                creationDate: new Date().toISOString(),
                                editDate: new Date().toISOString(),
                                icon: null,
                                permissions: {
                                    canRead: true,
                                    canWrite: true,
                                    canDelete: false,
                                    canShare: true,
                                    userPermissions: ['read', 'write'],
                                    groupPermissions: ['read'],
                                    publicAccess: false
                                },
                                metadata: {
                                    title: {
                                        name: 'Title',
                                        type: 'text',
                                        value: sharedId ? 'REPORT No. 187/20 CASE 12.204 - ADMISSIBILITY AND MERITS - ACTIVE MEMORY CIVIL ASSOCIATION' : `Mock Entity ${entityId}`,
                                        formattedValue: sharedId ? 'REPORT No. 187/20 CASE 12.204 - ADMISSIBILITY AND MERITS - ACTIVE MEMORY CIVIL ASSOCIATION' : `Mock Entity ${entityId}`,
                                        displayValue: sharedId ? 'REPORT No. 187/20 CASE 12.204 - ADMISSIBILITY AND MERITS - ACTIVE MEMORY CIVIL ASSOCIATION' : `Mock Entity ${entityId}`,
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    description: {
                                        name: 'Description',
                                        type: 'markdown',
                                        value: sharedId ? 'On July 16, 1999, the Inter-American Commission on Human Rights (hereinafter "the Inter-American Commission," "the Commission," or "the IACHR") received a petition signed by a group of victims and relatives of the victims of the terrorist attack perpetrated against the headquarters of the Israeli-Argentinian Mutual Association [Asociación Mutual Israelita Argentina](AMIA) organized through the Active Memory Civil Association [Asociación Civil Memoria Activa] 1. The petitioners affirmed that the Argentine State (hereinafter "the Argentine State", "the State" or "Argentina") is internationally responsible for the violation of its duty to prevent the terrorist attack that occurred on July 18, 1994, which caused the death of 85 people and serious injuries to the detriment of at least 151 other people ("the alleged victims"), and due to the state of impunity, to date, of the facts.' : 'Mock description',
                                        formattedValue: sharedId ? 'On July 16, 1999, the Inter-American Commission on Human Rights (hereinafter "the Inter-American Commission," "the Commission," or "the IACHR") received a petition signed by a group of victims and relatives of the victims of the terrorist attack perpetrated against the headquarters of the Israeli-Argentinian Mutual Association [Asociación Mutual Israelita Argentina](AMIA) organized through the Active Memory Civil Association [Asociación Civil Memoria Activa] 1. The petitioners affirmed that the Argentine State (hereinafter "the Argentine State", "the State" or "Argentina") is internationally responsible for the violation of its duty to prevent the terrorist attack that occurred on July 18, 1994, which caused the death of 85 people and serious injuries to the detriment of at least 151 other people ("the alleged victims"), and due to the state of impunity, to date, of the facts.' : 'Mock description',
                                        displayValue: sharedId ? 'On July 16, 1999, the Inter-American Commission on Human Rights (hereinafter "the Inter-American Commission," "the Commission," or "the IACHR") received a petition signed by a group of victims and relatives of the victims of the terrorist attack perpetrated against the headquarters of the Israeli-Argentinian Mutual Association [Asociación Mutual Israelita Argentina](AMIA) organized through the Active Memory Civil Association [Asociación Civil Memoria Activa] 1. The petitioners affirmed that the Argentine State (hereinafter "the Argentine State", "the State" or "Argentina") is internationally responsible for the violation of its duty to prevent the terrorist attack that occurred on July 18, 1994, which caused the death of 85 people and serious injuries to the detriment of at least 151 other people ("the alleged victims"), and due to the state of impunity, to date, of the facts.' : 'Mock description',
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    country: {
                                        name: 'Country',
                                        type: 'select',
                                        value: sharedId ? 'Argentina' : 'Mock Country',
                                        formattedValue: sharedId ? { value: 'Argentina', icon: '🇦🇷' } : { value: 'Mock Country' },
                                        displayValue: sharedId ? 'Argentina' : 'Mock Country',
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    date: {
                                        name: 'Date',
                                        type: 'date',
                                        value: sharedId ? 1594684800000 : Date.now(), // July 14, 2020
                                        formattedValue: sharedId ? 'July 14, 2020' : new Date().toLocaleDateString(),
                                        displayValue: sharedId ? 'July 14, 2020' : new Date().toLocaleDateString(),
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    incidentDate: {
                                        name: 'Date of the incident',
                                        type: 'date',
                                        value: sharedId ? 774144000000 : Date.now(), // July 18, 1994
                                        formattedValue: sharedId ? 'July 18, 1994' : new Date().toLocaleDateString(),
                                        displayValue: sharedId ? 'July 18, 1994' : new Date().toLocaleDateString(),
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    type: {
                                        name: 'Type',
                                        type: 'select',
                                        value: sharedId ? 'Monitoring compliance with Judgment' : 'Mock Type',
                                        formattedValue: sharedId ? { value: 'Monitoring compliance with Judgment' } : { value: 'Mock Type' },
                                        displayValue: sharedId ? 'Monitoring compliance with Judgment' : 'Mock Type',
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    mechanism: {
                                        name: 'Mechanism',
                                        type: 'select',
                                        value: sharedId ? 'Corte Interamericana de Derechos Humanos' : 'Mock Mechanism',
                                        formattedValue: sharedId ? { value: 'Corte Interamericana de Derechos Humanos', url: '#' } : { value: 'Mock Mechanism' },
                                        displayValue: sharedId ? 'Corte Interamericana de Derechos Humanos' : 'Mock Mechanism',
                                        showInCard: true,
                                        noLabel: false
                                    },
                                    signatories: {
                                        name: 'Signatories',
                                        type: 'select',
                                        value: sharedId ? 'Diego García-Sayán' : 'Mock Signatory',
                                        formattedValue: sharedId ? { value: 'Diego García-Sayán', url: '#' } : { value: 'Mock Signatory' },
                                        displayValue: sharedId ? 'Diego García-Sayán' : 'Mock Signatory',
                                        showInCard: true,
                                        noLabel: false
                                    }
                                },
                                relationships: [],
                                files: {
                                    documents: sharedId ? [
                                        {
                                            id: 'doc-1',
                                            filename: 'REPORT No. 187/20 CASE 12.204.pdf',
                                            url: '#',
                                            type: 'PDF',
                                            size: 2400000,
                                            processed: true
                                        }
                                    ] : [],
                                    attachments: sharedId ? [
                                        {
                                            id: 'att-1',
                                            filename: 'Reparación sobre atención médica en 9 casos colombianos. Supervisión de cumplimiento de Sentencia. Resolución del Presidente de la CorteIDH de 8 de febrero de 2012.docx',
                                            originalname: 'Reparación sobre atención médica en 9 casos colombianos. Supervisión de cumplimiento de Sentencia. Resolución del Presidente de la CorteIDH de 8 de febrero de 2012.docx',
                                            url: '#',
                                            type: 'Document',
                                            size: 50000,
                                            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                        },
                                        {
                                            id: 'att-2',
                                            filename: 'Supervisión de cumplimiento de Sentencia.docx',
                                            originalname: 'Supervisión de cumplimiento de Sentencia.docx',
                                            url: '#',
                                            type: 'Document',
                                            size: 30000,
                                            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                        },
                                        {
                                            id: 'att-3',
                                            filename: 'Resolución del Presidente de la CorteIDH de 8 de febrero de 2012.mpeg',
                                            originalname: 'Resolución del Presidente de la CorteIDH de 8 de febrero de 2012.mpeg',
                                            url: '#',
                                            type: 'Video',
                                            size: 15000000,
                                            mimetype: 'video/mpeg'
                                        }
                                    ] : [],
                                    processed: true
                                },
                                navigation: {
                                    availableTabs: {
                                        info: {
                                            id: 'info',
                                            label: 'Information',
                                            icon: 'info',
                                            enabled: true,
                                            visible: true,
                                            component: 'InfoTab'
                                        }
                                    },
                                    defaultTab: 'info',
                                    hasPageView: false,
                                    hasRelationships: false,
                                    hasNewRelationships: false,
                                    panelOpen: false,
                                    copyFrom: false,
                                    copyFromProps: []
                                }
                            }
                        };
                    }
                    return { data: null };
                },
                post: async (url: string, data?: any) => {
                    console.log('API POST:', url, data);
                    if (url.includes('/entities/batch')) {
                        const { entityIds } = data;
                        return {
                            data: entityIds.map((id: string) => ({
                                _id: id,
                                sharedId: `shared-${id}`,
                                title: `Mock Entity ${id}`,
                                language: 'en',
                                template: {
                                    id: 'template-123',
                                    name: 'Test Template',
                                    properties: []
                                },
                                creationDate: new Date().toISOString(),
                                editDate: new Date().toISOString(),
                                icon: null,
                                permissions: {
                                    canRead: true,
                                    canWrite: true,
                                    canDelete: false,
                                    canShare: true,
                                    userPermissions: ['read', 'write'],
                                    groupPermissions: ['read'],
                                    publicAccess: false
                                },
                                metadata: {
                                    title: {
                                        name: 'Title',
                                        type: 'text',
                                        value: `Mock Entity ${id}`,
                                        formattedValue: `Mock Entity ${id}`,
                                        displayValue: `Mock Entity ${id}`,
                                        showInCard: true,
                                        noLabel: false
                                    }
                                },
                                relationships: [],
                                files: {
                                    documents: [],
                                    attachments: [],
                                    processed: false
                                },
                                navigation: {
                                    availableTabs: {
                                        info: {
                                            id: 'info',
                                            label: 'Information',
                                            icon: 'info',
                                            enabled: true,
                                            visible: true,
                                            component: 'InfoTab'
                                        }
                                    },
                                    defaultTab: 'info',
                                    hasPageView: false,
                                    hasRelationships: false,
                                    hasNewRelationships: false,
                                    panelOpen: false,
                                    copyFrom: false,
                                    copyFromProps: []
                                }
                            }))
                        };
                    }
                    return { data: null };
                },
                put: async (url: string, data?: any) => {
                    console.log('API PUT:', url, data);
                    return { data };
                },
                delete: async (url: string) => {
                    console.log('API DELETE:', url);
                    return { status: 200 };
                },
                head: async (url: string) => {
                    console.log('API HEAD:', url);
                    return { status: 200 };
                }
            };

            // Register dependencies
            container.setEntityRepository(new EntityRepositoryImpl(apiClient));

            // Create a mock entity composition service
            const mockEntityCompositionService = {
                composeEntity: async (entityId: string, options: any, context: any) => {
                    console.log('=== MOCK ENTITY COMPOSITION SERVICE ===');
                    console.log('Mock EntityCompositionService.composeEntity:', entityId, options, context);
                    const repository = container.getEntityRepository();
                    console.log('Calling repository.findById with:', entityId);
                    const entity = await repository.findById(entityId, options);
                    console.log('Repository returned entity:', entity);
                    if (!entity) {
                        console.log('❌ Entity not found');
                        return {
                            entity: null,
                            performance: { compositionTime: 0, resolutionTime: 0, cacheHits: 0, cacheMisses: 0 },
                            success: false,
                            error: 'Entity not found'
                        };
                    }
                    console.log('✅ Entity found, returning:', entity);
                    return {
                        entity: entity,
                        performance: { compositionTime: 10, resolutionTime: 5, cacheHits: 0, cacheMisses: 1 },
                        success: true
                    };
                },
                composeEntities: async (entityIds: string[], options: any, context: any) => {
                    console.log('Mock EntityCompositionService.composeEntities:', entityIds, options, context);
                    const repository = container.getEntityRepository();
                    const entities = await repository.findByIds(entityIds, options);
                    return {
                        entities: entities,
                        performance: {
                            totalTime: 20,
                            compositionTime: 15,
                            resolutionTime: 5,
                            cacheHits: 0,
                            cacheMisses: entityIds.length,
                            sharedResourceHits: 0
                        },
                        errors: [],
                        success: true,
                        totalProcessed: entityIds.length,
                        successCount: entities.length,
                        errorCount: 0
                    };
                },
                composeEntitiesForListView: async (entityIds: string[], context: any) => {
                    return mockEntityCompositionService.composeEntities(entityIds, {
                        includeTemplate: true,
                        includeProperties: false,
                        includeMetadata: false,
                        includeRelationships: false,
                        includeFiles: false,
                        includeNavigation: false,
                        includePermissions: true,
                        onlyForCards: true
                    }, context);
                },
                composeEntitiesForCardView: async (entityIds: string[], context: any) => {
                    return mockEntityCompositionService.composeEntities(entityIds, {
                        includeTemplate: true,
                        includeProperties: true,
                        includeMetadata: true,
                        includeRelationships: false,
                        includeFiles: false,
                        includeNavigation: false,
                        includePermissions: true,
                        onlyForCards: true
                    }, context);
                },
                composeEntitiesForDetailView: async (entityIds: string[], context: any) => {
                    return mockEntityCompositionService.composeEntities(entityIds, {
                        includeTemplate: true,
                        includeProperties: true,
                        includeMetadata: true,
                        includeRelationships: true,
                        includeFiles: true,
                        includeNavigation: true,
                        includePermissions: true
                    }, context);
                },
                composeEntitiesForFormView: async (entityIds: string[], context: any) => {
                    return mockEntityCompositionService.composeEntities(entityIds, {
                        includeTemplate: true,
                        includeProperties: true,
                        includeMetadata: true,
                        includeRelationships: true,
                        includeFiles: true,
                        includeNavigation: true,
                        includePermissions: true,
                        excludePreview: true
                    }, context);
                },
                composeEntitiesByTemplate: async (templateId: string, options: any, context: any) => {
                    console.log('Mock EntityCompositionService.composeEntitiesByTemplate:', templateId, options, context);
                    const repository = container.getEntityRepository();
                    const entities = await repository.findByTemplate(templateId, options);
                    const entityIds = entities.map(entity => entity.id);
                    return mockEntityCompositionService.composeEntities(entityIds, options, context);
                }
            };

            container.setEntityCompositionService(mockEntityCompositionService as any);

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

export default EntityCompositionDemo;
