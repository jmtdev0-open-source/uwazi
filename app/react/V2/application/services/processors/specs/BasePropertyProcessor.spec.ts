import { BasePropertyProcessor } from '../BasePropertyProcessor';
import { ProcessingContext } from '../types';
import { processingContext } from './fixtures';

// Mock implementation of BasePropertyProcessor for testing
class TestBasePropertyProcessor extends BasePropertyProcessor {
    readonly name = 'TestBasePropertyProcessor';
    readonly priority = 50;
    readonly propertyTypes = ['test'];

    protected formatProperty(property: any, _context: ProcessingContext): any[] {
        // Test implementation that adds a test prefix
        return [
            {
                value: property.value,
                label: `test_${property.value?.toString() || ''}`,
                displayValue: `test_${property.value?.toString() || ''}`,
            },
        ];
    }

    // Expose protected methods for testing
    public testGetPropertyLabel(property: any, fieldName: string): string {
        return this.getPropertyLabel(property, fieldName);
    }

    public testBuildPropertyMetadata(property: any, fieldName: string, context: ProcessingContext) {
        return this.buildPropertyMetadata(property, fieldName, context);
    }

    public testIsInheritedProperty(property: any): boolean {
        return this.isInheritedProperty(property);
    }

    public testShouldSkipFormatting(context: ProcessingContext, formatKey?: string): boolean {
        return this.shouldSkipFormatting(context, formatKey);
    }

    public testGetCustomFormat(context: ProcessingContext, formatKey: string, defaultFormat: string): string {
        return this.getCustomFormat(context, formatKey, defaultFormat);
    }

    public testCreateRawValues(property: any) {
        return this.createRawValues(property);
    }

    public testGetTranslatedLabel(property: any, fieldName: string, context: ProcessingContext): string | undefined {
        return this.getTranslatedLabel(property, fieldName, context);
    }
}

describe('BasePropertyProcessor', () => {
    let processor: TestBasePropertyProcessor;
    let mockContext: ProcessingContext;

    beforeEach(() => {
        processor = new TestBasePropertyProcessor();

        mockContext = processingContext;
    });

    describe('Basic Functionality', () => {
        it('should process properties successfully', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'testProperty',
                    type: 'test',
                    value: 'testValue',
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(1);

            const testResult = result.get('entity1:testProperty')!;
            expect(testResult).toBeDefined();
            expect(testResult.values[0].value).toBe('testValue');
            expect(testResult.values[0].label).toBe('test_testValue');
            expect(testResult.values[0].displayValue).toBe('test_testValue');
        });

        it('should handle multiple properties', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'property1',
                    type: 'test',
                    value: 'value1',
                },
                {
                    _entityId: 'entity1',
                    name: 'property2',
                    type: 'test',
                    value: 'value2',
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(2);

            const result1 = result.get('entity1:property1')!;
            expect(result1).toBeDefined();
            expect(result1.values[0].value).toBe('value1');

            const result2 = result.get('entity1:property2')!;
            expect(result2).toBeDefined();
            expect(result2.values[0].value).toBe('value2');
        });

        it('should handle empty properties array', async () => {
            const properties: any[] = [];

            const result = await processor.processBatch(properties, mockContext);

            expect(result.size).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle processing errors gracefully', async () => {
            const properties = [
                {
                    _entityId: 'entity1',
                    name: 'errorProperty',
                    type: 'test',
                    value: null, // This should be handled gracefully
                },
            ];

            const result = await processor.processBatch(properties, mockContext);

            // Should not throw and should handle null values gracefully
            expect(result.size).toBe(1);

            const nullResult = result.get('entity1:errorProperty')!;
            expect(nullResult).toBeDefined();
            expect(nullResult.values[0].value).toBe(null);
            expect(nullResult.values[0].label).toBe('test_');
            expect(nullResult.values[0].displayValue).toBe('test_');
        });
    });

    describe('Utility Methods', () => {
        it('should get property label correctly', () => {
            const property = { label: 'Test Label', name: 'testName' };
            const label = processor.testGetPropertyLabel(property, 'fieldName');

            expect(label).toBe('Test Label');
        });

        it('should fall back to name when label is not available', () => {
            const property = { name: 'testName' };
            const label = processor.testGetPropertyLabel(property, 'fieldName');

            expect(label).toBe('testName');
        });

        it('should fall back to fieldName when neither label nor name is available', () => {
            const property = {};
            const label = processor.testGetPropertyLabel(property, 'fieldName');

            expect(label).toBe('fieldName');
        });

        it('should build property metadata correctly', () => {
            const property = {
                type: 'test',
                showInCard: true,
                required: true,
                multiple: false,
            };

            const metadata = processor.testBuildPropertyMetadata(property, 'fieldName', mockContext);

            expect(metadata.propertyType).toBe('test');
            expect(metadata.showInCard).toBe(true);
            expect(metadata.isRequired).toBe(true);
            expect(metadata.isMultiple).toBe(false);
        });

        it('should detect inherited properties', () => {
            const inheritedProperty = {
                inherited: true,
                inheritedType: 'parent',
                inheritedValue: 'parentValue',
            };

            const isInherited = processor.testIsInheritedProperty(inheritedProperty);
            expect(isInherited).toBe(true);
        });

        it('should detect non-inherited properties', () => {
            const regularProperty = {
                type: 'test',
                value: 'testValue',
            };

            const isInherited = processor.testIsInheritedProperty(regularProperty);
            expect(isInherited).toBe(false);
        });
    });

    describe('Default Implementations', () => {
        it('should use default shouldSkipFormatting implementation', () => {
            const shouldSkip = processor.testShouldSkipFormatting(mockContext, 'test');
            expect(shouldSkip).toBe(false);
        });

        it('should use default getCustomFormat implementation', () => {
            const customFormat = processor.testGetCustomFormat(mockContext, 'test', 'defaultFormat');
            expect(customFormat).toBe('defaultFormat');
        });

        it('should use default createRawValues implementation', () => {
            const property = { value: 'testValue' };
            const rawValues = processor.testCreateRawValues(property);

            expect(rawValues).toHaveLength(1);
            expect(rawValues[0].value).toBe('testValue');
            expect(rawValues[0].label).toBe('testValue');
            expect(rawValues[0].displayValue).toBe('testValue');
        });
    });

    describe('Translation Support', () => {
        it('should handle missing translations gracefully', () => {
            const property = { translateContext: 'testKey' };
            const translatedLabel = processor.testGetTranslatedLabel(property, 'fieldName', mockContext);

            expect(translatedLabel).toBeUndefined();
        });

        it('should return undefined when translateLabels is false', () => {
            mockContext.options.translateLabels = false;

            const property = { translateContext: 'testKey' };
            const translatedLabel = processor.testGetTranslatedLabel(property, 'fieldName', mockContext);

            expect(translatedLabel).toBeUndefined();
        });
    });
});
