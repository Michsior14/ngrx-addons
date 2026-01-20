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
  });
});
