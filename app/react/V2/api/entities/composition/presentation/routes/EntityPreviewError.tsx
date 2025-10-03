import React from 'react';

/**
 * Entity Preview Error Component
 *
 * Simple error component for entity preview route.
 * This can be used as errorElement in route configuration.
 */
export default function EntityPreviewError() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #dc3545',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#dc3545',
            marginBottom: '16px',
          }}
        >
          Failed to Load Entity
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
          }}
        >
          The entity could not be loaded. Please check the entity ID and try again.
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
