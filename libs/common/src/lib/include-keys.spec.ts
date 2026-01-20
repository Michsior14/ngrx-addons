import { of } from 'rxjs';
import { includeKeys } from './include-keys';

describe('includeKeys', () => {
  it('should include single key', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(includeKeys(['a'])).subscribe((result) => {
      expect(result).toEqual({ a: 1 });
      done();
    });
  });

  it('should include multiple keys', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(includeKeys(['a', 'c'])).subscribe((result) => {
      expect(result).toEqual({ a: 1, c: 3 });
      done();
    });
  });

  it('should return empty object when no keys match', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state
      .pipe(includeKeys(['d' as keyof { a: number }]))
      .subscribe((result) => {
        expect(result).toEqual({});
        done();
      });
  });

  it('should return empty object when keys array is empty', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(includeKeys([])).subscribe((result) => {
      expect(result).toEqual({});
      done();
    });
  });

  it('should include all keys when all are specified', (done) => {
    const state = of({ a: 1, b: 2 });
    state.pipe(includeKeys(['a', 'b'])).subscribe((result) => {
      expect(result).toEqual({ a: 1, b: 2 });
      done();
    });
  });

  it('should preserve nested objects', (done) => {
    const state = of({ a: { nested: 1 }, b: 2 });
    state.pipe(includeKeys(['a'])).subscribe((result) => {
      expect(result).toEqual({ a: { nested: 1 } });
      done();
    });
  });
});
