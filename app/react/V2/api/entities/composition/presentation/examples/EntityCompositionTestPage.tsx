/**
 * Entity Composition Test Page
 * Simple test page to demonstrate the composition system
 */
import React from 'react';
import { Link } from 'react-router';

const EntityCompositionTestPage: React.FC = () => {
    return (
        <div style={{
            padding: '40px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{
                fontSize: '32px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '24px'
            }}>
                Entity Composition System Demo
            </h1>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px'
                }}>
                    Demo Options
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#333',
                            marginBottom: '8px'
                        }}>
                            Mock Entity Demo
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '12px'
                        }}>
                            Test the composition system with mock data
                        </p>
                        <Link
                            to="/settings/entity-composition"
                            style={{
                                backgroundColor: '#0066cc',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                display: 'inline-block'
                            }}
                        >
                            View Mock Demo
                        </Link>
                    </div>

                    <div>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#333',
                            marginBottom: '8px'
                        }}>
                            Real Entity Demo
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '12px'
                        }}>
                            Test with a real entity from your database (replace with actual sharedId)
                        </p>
                        <Link
                            to="/settings/entity-composition/your-entity-shared-id"
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                display: 'inline-block'
                            }}
                        >
                            View Real Entity Demo
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #e9ecef'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                }}>
                    How to Use
                </h3>
                <ol style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                }}>
                    <li>Click "View Mock Demo" to see the composition system with sample data</li>
                    <li>Replace "your-entity-shared-id" in the real entity URL with an actual entity ID from your database</li>
                    <li>The system will attempt to fetch real data from the API, falling back to mock data if needed</li>
                    <li>Explore the different sections: Document, PDF Metadata, Description, Geolocation, and Other Files</li>
                </ol>
            </div>
        </div>
    );
};

export default EntityCompositionTestPage;
