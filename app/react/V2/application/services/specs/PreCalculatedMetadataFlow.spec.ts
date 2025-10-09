import { CompositionOptions } from 'app/V2/domain';
import { EntityAdapterFactory } from '../EntityAdapterFactory';
import { settings, singleEntity, templates, translations } from './fixtures';


describe('Pre-Calculated Metadata Flow', () => {
    let testEntities: any[];
    let testOptions: CompositionOptions;

    beforeEach(() => {
        testEntities = singleEntity;
        testOptions = {
            includeMetadata: true,
            includePropertyMetadata: true,
            translateLabels: true,
            dateOptions: {
                dateFormat: 'YYYY-MM-DD',
                includeTime: false,
                relativeTime: false,
            },
            selectOptions: {
                showLabels: true,
                showIcons: false,
                showUrls: false,
            },
        };
    });

    describe('Entity Processing Flow', () => {
        it('should process entities successfully', async () => {
            const processor = EntityAdapterFactory.createPipeline(testOptions, {
                language: 'en',
                userId: 'user123',
                userPermissions: ['read', 'write'],
                settings,
                templates,
                translations,
            });

            const result = await processor.processAllEntities(testEntities);

            expect(result).toEqual({});
            expect(result.entities).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.entities.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle processing errors gracefully', async () => {
            const processor = EntityAdapterFactory.createPipeline(testOptions, {
                language: 'en',
                userId: 'user123',
                userPermissions: ['read', 'write'],
                settings,
                templates,
                translations,
            });

            const invalidEntities = [
                {
                    _id: 'invalid',
                    metadata: {
                        invalidField: { type: 'invalid', value: null },
                    },
                },
            ];

            const result = await processor.processAllEntities(invalidEntities);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.entities).toBeDefined();
        });
    });
});
