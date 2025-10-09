import { LoaderFunction } from 'react-router';
import { IncomingHttpHeaders } from 'http';
import {
  fullDetailOptions,
  dateFieldsOptions,
  selectFieldsOptions,
} from 'app/V2/application/optionsPresets';
import { getEntityCompositionUseCase } from 'app/V2/application/container/singletons';

export const entityPreviewLoader =
  (headers?: IncomingHttpHeaders): LoaderFunction =>
    async ({ params }) => {
      try {
        const entityId = params.sharedId;
        if (!entityId) {
          throw new Error('Entity ID is required');
        }

        const entityCompositionUseCase = await getEntityCompositionUseCase();

        const [fullComposition, dateComposition, selectComposition] = await Promise.all([
          entityCompositionUseCase.composeEntity(entityId, fullDetailOptions(), { headers }),
          entityCompositionUseCase.composeEntity(entityId, dateFieldsOptions(), { headers }),
          entityCompositionUseCase.composeEntity(entityId, selectFieldsOptions(), { headers }),
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
