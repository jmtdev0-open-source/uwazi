import { LoaderFunction } from 'react-router';
import * as entitiesApi from '../../../index';
import { CompositionServiceFactory } from '../../application/services/CompositionServiceFactory';
import { IncomingHttpHeaders } from 'http';

export const entityPreviewLoader = (headers?: IncomingHttpHeaders): LoaderFunction =>
  async ({ params }) => {
    try {
        const entityId = params.sharedId;
        if (!entityId) {
            throw new Error('Entity ID is required');
        }

        const useCase = await CompositionServiceFactory.createCompositionService(entitiesApi);

        const [fullComposition, dateComposition, selectComposition] = await Promise.all([
            useCase.composeEntity(entityId, {
                includeTemplate: true,
                includeProperties: true,
                includeMetadata: true,
                includeRelationships: true,
                includeFiles: true,
                includeNavigation: true,
                includePermissions: true
            }, { headers: headers }),
            useCase.composeEntity(entityId, {
                includeTemplate: true,
                includeProperties: true,
                includeMetadata: true,
                includeRelationships: false,
                includeFiles: false,
                includeNavigation: false,
                includePermissions: false,
                fieldTypes: ['date', 'daterange']
            }, { headers: headers }),
            useCase.composeEntity(entityId, {
                includeTemplate: true,
                includeProperties: true,
                includeMetadata: true,
                includeRelationships: true,
                includeFiles: false,
                includeNavigation: false,
                includePermissions: false,
                fieldTypes: ['select', 'multiselect', 'relationship']
            }, { headers: headers })
        ]);

        
        return {
            entity: fullComposition.entity,
            compositions: {
                full: fullComposition.entity,
                dateFields: dateComposition.entity,
                selectFields: selectComposition.entity
            },
            performance: {
                compositionTime: 0,
                resolutionTime: 0,
                cacheHits: 0,
                cacheMisses: 0
            }
        };
        
    } catch (error) {
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