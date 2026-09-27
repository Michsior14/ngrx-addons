import { isEqual } from './is-equal';

describe('isEqual', () => {
  describe('identical references', () => {
    it('should return true for same reference', () => {
      const obj = { a: 1 };
      expect(isEqual(obj, obj)).toBe(true);
    });

    it('should return true for identical primitives', () => {
      expect(isEqual(1 as never, 1 as never)).toBe(true);
      expect(isEqual('test' as never, 'test' as never)).toBe(true);
    });
  });

  describe('equal objects', () => {
    it('should return true for equal simple objects', () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    });

    it('should return true for equal arrays', () => {
      expect(isEqual({ a: [1] }, { a: [1] })).toBe(true);
    });

    it('should return true for deeply nested equal objects', () => {
      expect(
        isEqual(
          { a: [{ b: 1 }, { b: { a: 1 } }] },
          { a: [{ b: 1 }, { b: { a: 1 } }] },
        ),
      ).toBe(true);
    });

    it('should return true for empty objects', () => {
      expect(isEqual({}, {})).toBe(true);
    });

    it('should return true for null/undefined', () => {
      [undefined, null].forEach((test) => {
        expect(isEqual(test, test)).toBe(true);
      });
    });
  });

  describe('null/undefined handling', () => {
    it('should return false if one is null/undefined', () => {
      const a = { a: 1 };
      expect(isEqual(a, undefined)).toEqual(false);
      expect(isEqual(a, null)).toEqual(false);
      expect(isEqual(undefined, a)).toEqual(false);
      expect(isEqual(null, a)).toEqual(false);
    });

    it('should return false for null vs undefined', () => {
      expect(isEqual(null, undefined)).toEqual(false);
      expect(isEqual(undefined, null)).toEqual(false);
    });
  });

  describe('type mismatch', () => {
    it('should return false if one is not object', () => {
      const a = { a: 1 };
      expect(isEqual(a, 'test' as never)).toEqual(false);
      expect(isEqual('test', a as never)).toEqual(false);
    });

    it('should return false for number vs object', () => {
      expect(isEqual({ a: 1 }, 1 as never)).toEqual(false);
    });
  });

  describe('different objects', () => {
    it('should return false for different keys', () => {
      expect(isEqual({ a: 1 }, { b: 1 })).toEqual(false);
    });

    it('should return false for different number of keys', () => {
      expect(isEqual({}, { a: 1 })).toEqual(false);
      expect(isEqual({ a: 1 }, {})).toEqual(false);
    });

    it('should return false for different nested structures', () => {
      expect(isEqual({ a: { b: 1 } }, { a: 1 })).toEqual(false);
    });

    it('should return false for different array values', () => {
      expect(isEqual({ a: [1] }, { a: [2] })).toEqual(false);
    });

    it('should return false for different nested object values', () => {
      expect(isEqual({ a: [{ a: 1 }] }, { a: [{ b: 1 }] })).toEqual(false);
    });

    it('should return false for different array lengths', () => {
      expect(isEqual({ a: [1, 2] }, { a: [1] })).toEqual(false);
    });

    it('should return false for same key count but different key names', () => {
      expect(isEqual({ a: 1 }, { b: 1 })).toEqual(false);
      expect(isEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toEqual(false);
    });

    it('should return false for different keys with undefined values', () => {
      expect(isEqual({ a: undefined }, { b: undefined })).toEqual(false);
    });

    it('should return false for an array and an object with the same keys', () => {
      expect(isEqual({ a: [1, 2] }, { a: { 0: 1, 1: 2 } } as never)).toEqual(
        false,
      );
    });
  });

  describe('built-in objects', () => {
    it('should compare dates by time', () => {
      expect(isEqual({ a: new Date(1) }, { a: new Date(1) })).toBe(true);
      expect(isEqual({ a: new Date(1) }, { a: new Date(2) })).toBe(false);
    });

    it('should compare maps by entries', () => {
      expect(
        isEqual(new Map([['a', { b: 1 }]]), new Map([['a', { b: 1 }]])),
      ).toBe(true);
      expect(
        isEqual(new Map([['a', { b: 1 }]]), new Map([['a', { b: 2 }]])),
      ).toBe(false);
      expect(isEqual(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false);
      expect(isEqual(new Map([['a', 1]]), new Map())).toBe(false);
    });

    it('should compare sets by values', () => {
      expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
      expect(isEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
      expect(isEqual(new Set([1]), new Set([1, 2]))).toBe(false);
    });
  });
});
