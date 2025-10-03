import { LoaderFunction } from 'react-router';
import { getBySharedId } from '../../../index';

/**
 * Entity Preview Loader
 * 
 * Minimal loader function that reuses existing entity API client.
 * This follows the existing Uwazi loader patterns.
 */
export const entityPreviewLoader = (): LoaderFunction =>
  async ({ params }) => {
    try {
        // Extract entity ID from route parameters
        const entityId = params.sharedId; // Using sharedId to match existing routes
        
        if (!entityId) {
            throw new Error('Entity ID is required');
        }

        console.log('Entity preview loader called with ID:', entityId);

        // Use existing API client
        const entities = await getBySharedId({
            sharedId: entityId,
            language: 'en', // Default language
            omitRelationships: true
        });
        
        console.log('Entities fetched:', entities);

        if (!entities || entities.length === 0) {
            console.error('Entity not found');
            throw new Error('Entity not found');
        }

        // Get the first entity (should be only one)
        const entity = entities[0];
        console.log('Entity fetch successful:', entity);
        
        return {
            entity: entity,
            performance: {
                compositionTime: 0,
                resolutionTime: 0,
                cacheHits: 0,
                cacheMisses: 0
            }
        };
        
    } catch (error) {
        console.error('Entity preview loader error:', error);
        
        // Return a proper error response that React Router can handle
        throw new Response(
            JSON.stringify({
                error: 'Failed to load entity',
                message: error instanceof Error ? error.message : 'Unknown error',
                entityId: params.sharedId
            }),
            {
                status: 404,
                statusText: 'Entity Not Found',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
  };