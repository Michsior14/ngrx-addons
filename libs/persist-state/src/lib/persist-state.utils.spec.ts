import { isEqual } from './persist-state.utils';

describe('isEqual', () => {
  it('should return true if the same', () => {
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: [1] }, { a: [1] })).toBe(true);
    expect(
      isEqual(
        { a: [{ b: 1 }, { b: { a: 1 } }] },
        { a: [{ b: 1 }, { b: { a: 1 } }] }
      )
    ).toBe(true);
    [undefined, null].forEach((test) => expect(isEqual(test, test)).toBe(true));
  });

  it('should return false if one is empty', () => {
    const a = { a: 1 };
    expect(isEqual(a, undefined)).toEqual(false);
    expect(isEqual(a, null)).toEqual(false);
    expect(isEqual(undefined, a)).toEqual(false);
    expect(isEqual(null, a)).toEqual(false);
  });

  it('should return false if one is not object', () => {
    const a = { a: 1 };
    expect(isEqual(a, 'test' as never)).toEqual(false);
    expect(isEqual('test', a as never)).toEqual(false);
  });

  it('should return false if different objects', () => {
    expect(isEqual({ a: 1 }, { b: 1 })).toEqual(false);
    expect(isEqual({}, { a: 1 })).toEqual(false);
    expect(isEqual({ a: { b: 1 } }, { a: 1 })).toEqual(false);
    expect(isEqual({ a: [1] }, { a: [2] })).toEqual(false);
    expect(isEqual({ a: [{ a: 1 }] }, { a: [{ b: 1 }] })).toEqual(false);
  });
});
