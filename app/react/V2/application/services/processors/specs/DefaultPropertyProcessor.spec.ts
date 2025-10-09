import { DefaultPropertyProcessor } from '../DefaultPropertyProcessor';
import { ProcessingContext } from '../types';
import { processingContext } from './fixtures';

describe('DefaultPropertyProcessor', () => {
    let processor: DefaultPropertyProcessor;
    let mockContext: ProcessingContext;

    beforeEach(() => {
        processor = new DefaultPropertyProcessor();

        mockContext = processingContext;
    });

    describe('Basic Functionality', () => {
        it('should process any property type successfully', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'stringProperty',
                    type: 'string',
                    value: 'testValue',
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const stringResult = result.get('entity1:stringProperty')!;
            expect(stringResult.values[0].value).toBe('testValue');
            expect(stringResult.values[0].label).toBe('testValue');
            expect(stringResult.values[0].displayValue).toBe('testValue');
        });

        it('should handle numeric values', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'numberProperty',
                    type: 'number',
                    value: 42,
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const numberResult = result.get('entity1:numberProperty')!;
            expect(numberResult.values[0].value).toBe(42);
            expect(numberResult.values[0].label).toBe('42');
            expect(numberResult.values[0].displayValue).toBe('42');
        });

        it('should handle boolean values', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'booleanProperty',
                    type: 'boolean',
                    value: true,
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const booleanResult = result.get('entity1:booleanProperty')!;
            expect(booleanResult.values[0].value).toBe(true);
            expect(booleanResult.values[0].label).toBe('true');
            expect(booleanResult.values[0].displayValue).toBe('true');
        });

        it('should handle object values', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'objectProperty',
                    type: 'object',
                    value: { key: 'value', nested: { data: 'test' } },
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const objectResult = result.get('entity1:objectProperty')!;
            expect(objectResult.values[0].value).toEqual({ key: 'value', nested: { data: 'test' } });
            expect(objectResult.values[0].label).toBe('[object Object]');
            expect(objectResult.values[0].displayValue).toBe('[object Object]');
        });

        it('should handle null values', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'nullProperty',
                    type: 'null',
                    value: null,
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const nullResult = result.get('entity1:nullProperty')!;
            expect(nullResult.values[0].value).toBe(null);
            expect(nullResult.values[0].label).toBe('');
            expect(nullResult.values[0].displayValue).toBe('');
        });

        it('should handle undefined values', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'undefinedProperty',
                    type: 'undefined',
                    value: undefined,
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const undefinedResult = result.get('entity1:undefinedProperty')!;
            expect(undefinedResult.values[0].value).toBe(undefined);
            expect(undefinedResult.values[0].label).toBe('');
            expect(undefinedResult.values[0].displayValue).toBe('');
        });
    });

    describe('Property Types', () => {
        it('should have correct processor configuration', () => {
            expect(processor.name).toBe('DefaultPropertyProcessor');
            expect(processor.priority).toBe(100);
            expect(processor.propertyTypes).toEqual(['any']);
        });

        it('should handle multiple different property types', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'stringProp',
                    type: 'string',
                    value: 'stringValue',
                },
                {
                    _entityId: 'entity1',
                    name: 'numberProp',
                    type: 'number',
                    value: 123,
                },
                {
                    _entityId: 'entity1',
                    name: 'booleanProp',
                    type: 'boolean',
                    value: false,
                },
                {
                    _entityId: 'entity1',
                    name: 'arrayProp',
                    type: 'array',
                    value: [1, 2, 3],
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(4);

            const stringResult = result.get('entity1:stringProp')!;
            expect(stringResult.values[0].value).toBe('stringValue');

            const numberResult = result.get('entity1:numberProp')!;
            expect(numberResult.values[0].value).toBe(123);

            const booleanResult = result.get('entity1:booleanProp')!;
            expect(booleanResult.values[0].value).toBe(false);

            const arrayResult = result.get('entity1:arrayProp')!;
            expect(arrayResult.values[0].value).toEqual([1, 2, 3]);
        });
    });

    describe('Error Handling', () => {
        it('should handle processing errors gracefully', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'errorProperty',
                    type: 'error',
                    value: 'testValue',
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);
        });

        it('should handle empty properties array', async () => {
            const properties: any[] = [];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(0);
        });
    });

    describe('Fallback Behavior', () => {
        it('should provide basic formatting for any property type', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'unknownProperty',
                    type: 'unknownType',
                    value: 'someValue',
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const unknownResult = result.get('entity1:unknownProperty')!;
            expect(unknownResult).toBeDefined();
            expect(unknownResult.values[0].value).toBe('someValue');
            expect(unknownResult.values[0].label).toBe('someValue');
            expect(unknownResult.values[0].displayValue).toBe('someValue');
        });

        it('should use default raw value creation', () => {
            const property = { value: 'testValue' };
            const rawValues = processor.createRawValues(property);

            expect(rawValues).toHaveLength(1);
            expect(rawValues[0].value).toBe('testValue');
            expect(rawValues[0].label).toBe('testValue');
            expect(rawValues[0].displayValue).toBe('testValue');
        });
    });

    describe('Inheritance', () => {
        it('should inherit from BasePropertyProcessor', () => {
            expect(processor).toBeInstanceOf(DefaultPropertyProcessor);
            expect(processor).toBeInstanceOf(Object);
        });

        it('should have access to base class utility methods', () => {
            const property = { label: 'Test Label', name: 'testName' };
            const label = processor.getPropertyLabel(property, 'fieldName');

            expect(label).toBe('Test Label');
        });

        it('should use default implementations from base class', () => {
            const shouldSkip = processor.shouldSkipFormatting(mockContext, 'test');
            expect(shouldSkip).toBe(false);

            const customFormat = processor.getCustomFormat(mockContext, 'test', 'defaultFormat');
            expect(customFormat).toBe('defaultFormat');
        });
    });
});
