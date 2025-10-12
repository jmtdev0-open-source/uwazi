import { EntityCompositionUseCaseImpl } from '../EntityCompositionUseCase';
import { EntityRepository } from '../../../infrastructure/repositories/EntityRepository';
import { EntitySchema } from 'shared/types/entityType';
import { Response } from 'app/V2/api/types';

describe('EntityCompositionUseCase Batch Processing', () => {
    let mockRepository: jest.Mocked<EntityRepository>;
    let useCase: EntityCompositionUseCaseImpl;

    beforeEach(() => {
        mockRepository = {
            getBySharedId: jest.fn(),
            getBySharedIds: jest.fn(),
            save: jest.fn(),
        } as jest.Mocked<EntityRepository>;

        useCase = new EntityCompositionUseCaseImpl(mockRepository);
    });

    describe('composeEntitiesForCardView', () => {
        it('should use single bulk fetch for multiple entities', async () => {
            const entityIds = ['entity-1', 'entity-2', 'entity-3'];
            const mockEntities: EntitySchema[] = [
                {
                    _id: 'entity-1',
                    title: 'Entity 1',
                    template: 'template1',
                    metadata: { title: [{ value: 'Entity 1' }] },
                    language: 'en',
                },
                {
                    _id: 'entity-2',
                    title: 'Entity 2',
                    template: 'template1',
                    metadata: { title: [{ value: 'Entity 2' }] },
                    language: 'en',
                },
                {
                    _id: 'entity-3',
                    title: 'Entity 3',
                    template: 'template1',
                    metadata: { title: [{ value: 'Entity 3' }] },
                    language: 'en',
                },
            ];

            mockRepository.getBySharedIds.mockResolvedValue(mockEntities);

            await useCase.composeEntitiesForCardView(entityIds, {
                userId: 'user123',
                userPermissions: ['read'],
            });

            // Verify single call, not multiple
            expect(mockRepository.getBySharedIds).toHaveBeenCalledTimes(1);
            expect(mockRepository.getBySharedIds).toHaveBeenCalledWith({
                sharedId: entityIds,
                language: 'en',
                omitRelationships: true,
            });
        });

        it('should handle batch processing performance with many entities', async () => {
            const entityIds = Array.from({ length: 50 }, (_, i) => `entity-${i}`);
            const mockEntities: EntitySchema[] = entityIds.map(id => ({
                _id: id,
                title: `Entity ${id}`,
                template: 'template1',
                metadata: { title: [{ value: `Entity ${id}` }] },
                language: 'en',
            }));

            mockRepository.getBySharedIds.mockResolvedValue(mockEntities);

            const startTime = Date.now();
            const result = await useCase.composeEntitiesForCardView(entityIds, {
                userId: 'user123',
                userPermissions: ['read'],
            });
            const duration = Date.now() - startTime;

            // Should be fast with bulk fetch (less than 1 second for 50 entities)
            expect(duration).toBeLessThan(1000);
            expect(result.success).toBe(true);
            expect(result.totalProcessed).toBe(50);
            expect(result.successCount).toBe(50);
            expect(result.errorCount).toBe(0);

            // Verify single API call for all entities
            expect(mockRepository.getBySharedIds).toHaveBeenCalledTimes(1);
        });

        it('should handle errors gracefully in batch processing', async () => {
            const entityIds = ['entity-1', 'entity-2'];

            mockRepository.getBySharedIds.mockRejectedValue(new Error('Network error'));

            const result = await useCase.composeEntitiesForCardView(entityIds, {
                userId: 'user123',
                userPermissions: ['read'],
            });

            expect(result.success).toBe(false);
            expect(result.entities).toEqual([]);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toBe('Network error');
            expect(result.totalProcessed).toBe(2);
            expect(result.successCount).toBe(0);
            expect(result.errorCount).toBe(2);
        });

        it('should process empty entity list', async () => {
            mockRepository.getBySharedIds.mockResolvedValue([]);

            const result = await useCase.composeEntitiesForCardView([], {
                userId: 'user123',
                userPermissions: ['read'],
            });

            expect(result.success).toBe(true);
            expect(result.entities).toEqual([]);
            expect(result.totalProcessed).toBe(0);
            expect(result.successCount).toBe(0);
            expect(result.errorCount).toBe(0);
        });
    });

    describe('composeEntities', () => {
        it('should use bulk fetch for multiple entities', async () => {
            const entityIds = ['entity-1', 'entity-2'];
            const mockEntities: EntitySchema[] = [
                {
                    _id: 'entity-1',
                    title: 'Entity 1',
                    template: 'template1',
                    metadata: { title: [{ value: 'Entity 1' }] },
                    language: 'en',
                },
                {
                    _id: 'entity-2',
                    title: 'Entity 2',
                    template: 'template1',
                    metadata: { title: [{ value: 'Entity 2' }] },
                    language: 'en',
                },
            ];

            mockRepository.getBySharedIds.mockResolvedValue(mockEntities);

            await useCase.composeEntities(
                entityIds,
                {
                    includeTemplate: true,
                    includeMetadata: true,
                },
                {
                    userId: 'user123',
                    userPermissions: ['read'],
                }
            );

            expect(mockRepository.getBySharedIds).toHaveBeenCalledTimes(1);
            expect(mockRepository.getBySharedIds).toHaveBeenCalledWith({
                sharedId: entityIds,
                language: 'en',
                omitRelationships: true,
            });
        });
    });
});
