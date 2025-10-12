import { DatePropertyProcessor } from '../DatePropertyProcessor';
import { ProcessingContext } from '../types';
import { processingContext } from './fixtures';

describe('AdapterDateProcessor', () => {
  let processor: DatePropertyProcessor;
  let mockContext: ProcessingContext;

  beforeEach(() => {
    processor = new DatePropertyProcessor();
    mockContext = processingContext;
  });

  describe('Performance Optimization', () => {
    it('should skip formatting when formatDate is false', async () => {
      mockContext.options.dateOptions = {
        formatDate: false,
      };

      const properties = [
        {
          _entityId: 'entity1',
          name: 'date',
          type: 'date',
          value: [{ value: 1759363200 }], // Oct 2, 2025
        },
        {
          _entityId: 'entity1',
          name: 'multidate',
          type: 'multidate',
          value: [
            { value: 1759276800 }, // Oct 1, 2025
            { value: 1759363200 }, // Oct 2, 2025
          ],
        },
      ];

      const result = await processor.processBatch(properties, mockContext);

      expect(result.size).toBe(2);

      const dateResult = result.get('entity1:date')!;
      expect(dateResult.values[0].value).toBe(1759363200);
      expect(dateResult.values[0].formattedValue).toBeUndefined();
      expect(dateResult.values[0].localizedValue).toBeUndefined();
      expect(dateResult.values[0].label).toBe('1759363200');
      expect(dateResult.values[0].displayValue).toBe('1759363200');

      const multidateResult = result.get('entity1:multidate')!;
      expect(multidateResult).toBeDefined();
      expect(multidateResult.values[0].value).toBe(1759276800);
      expect(multidateResult.values[1].value).toBe(1759363200);
    });

    it('should use custom dateFormat from options when provided', async () => {
      mockContext.options.dateOptions = {
        dateFormat: 'DD/MM/YYYY',
        formatDate: true,
      };

      const properties = [
        {
          _entityId: 'entity1',
          name: 'date',
          type: 'date',
          value: [{ value: 1759363200 }], // Oct 2, 2025
        },
      ];

      const result = await processor.processBatch(properties, mockContext);

      expect(result.size).toBe(1);

      const dateResult = result.get('entity1:date')!;
      expect(dateResult).toBeDefined();
      expect(dateResult.values[0].formattedValue).toBe('02/10/2025'); // DD/MM/YYYY format
    });

    it('should fall back to context dateFormatting when no custom format provided', async () => {
      mockContext.options.dateOptions = {
        formatDate: true,
      };

      const properties = [
        {
          _entityId: 'entity1',
          name: 'date',
          type: 'date',
          value: [{ value: 1759363200 }], // Oct 2, 2025
        },
      ];

      const result = await processor.processBatch(properties, mockContext);

      expect(result.size).toBe(1);

      const dateResult = result.get('entity1:date')!;
      expect(dateResult).toBeDefined();
      expect(dateResult.values[0].formattedValue).toBe('2025-10-02'); // YYYY-MM-DD format from context
    });

    it('should handle date ranges with raw values when formatDate is false', async () => {
      mockContext.options.dateOptions = {
        formatDate: false,
      };

      const properties = [
        {
          _entityId: 'entity1',
          name: 'daterange',
          type: 'daterange',
          value: [
            {
              value: {
                from: 1759276800, // Oct 1, 2025
                to: 1759363200, // Oct 2, 2025
              },
            },
          ],
        },
      ];

      const result = await processor.processBatch(properties, mockContext);

      expect(result.size).toBe(1);

      const daterangeResult = result.get('entity1:daterange')!;
      expect(daterangeResult).toBeDefined();
      expect(daterangeResult.values[0].value.from).toBe(1759276800);
      expect(daterangeResult.values[0].value.to).toBe(1759363200);
      expect(daterangeResult.values[0].label).toBe('1759276800 ~ 1759363200');
      expect(daterangeResult.values[0].displayValue).toBe('1759276800 ~ 1759363200');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates with custom format when formatDate is true', async () => {
      mockContext.options.dateOptions = {
        dateFormat: 'MM/DD/YYYY',
        formatDate: true,
      };

      const properties = [
        {
          _entityId: 'entity1',
          name: 'date',
          type: 'date',
          value: [{ value: 1759363200 }], // Oct 2, 2025
        },
      ];

      const result = await processor.processBatch(properties, mockContext);

      expect(result.size).toBe(1);

      const dateResult = result.get('entity1:date')!;
      expect(dateResult).toBeDefined();
      expect(dateResult.values[0].formattedValue).toBe('10/02/2025'); // MM/DD/YYYY format
      expect(dateResult.values[0].localizedValue).toBeDefined();
      expect(dateResult.values[0].displayValue).toBeDefined();
    });
  });
});
