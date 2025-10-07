import { LoaderFunction } from 'react-router';
import * as entitiesApi from '../../api/entities/index';
import { IncomingHttpHeaders } from 'http';
import { CompositionServiceFactory } from 'app/V2/application';
import { fullDetailOptions, dateFieldsOptions, selectFieldsOptions } from 'app/V2/application/optionsPresets';

export const entityPreviewLoader =
  (headers?: IncomingHttpHeaders): LoaderFunction =>
  async ({ params }) => {
    try {
      const entityId = params.sharedId;
      if (!entityId) {
        throw new Error('Entity ID is required');
      }
      const useCase = await CompositionServiceFactory.createCompositionService(entitiesApi);

      const [fullComposition, dateComposition, selectComposition] = await Promise.all([
        useCase.composeEntity(entityId, fullDetailOptions(), { headers }),
        useCase.composeEntity(entityId, dateFieldsOptions(), { headers }),
        useCase.composeEntity(entityId, selectFieldsOptions(), { headers }),
      ]);

      return {
        full: fullComposition.entity,
        dateFields: dateComposition.entity,
        selectFields: selectComposition.entity,
      };
    } catch (error) {
      throw new Response(
        JSON.stringify({
          error: 'Failed to load entity',
          message: error instanceof Error ? error.message : 'Unknown error',
          entityId: params.sharedId,
        }),
        {
          status: 404,
          statusText: 'Entity Not Found',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
