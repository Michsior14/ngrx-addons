import { of } from 'rxjs';
import { excludeKeys } from './exclude-keys';

describe('excludeKeys', () => {
  it('should exclude single key', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(excludeKeys(['a'])).subscribe((result) => {
      expect(result).toEqual({ b: 2, c: 3 });
      done();
    });
  });

  it('should exclude multiple keys', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(excludeKeys(['a', 'c'])).subscribe((result) => {
      expect(result).toEqual({ b: 2 });
      done();
    });
  });

  it('should return all keys when no keys match exclusion', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state
      .pipe(excludeKeys(['d' as keyof { a: number }]))
      .subscribe((result) => {
        expect(result).toEqual({ a: 1, b: 2, c: 3 });
        done();
      });
  });

  it('should return all keys when keys array is empty', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(excludeKeys([])).subscribe((result) => {
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
      done();
    });
  });

  it('should return empty object when all keys are excluded', (done) => {
    const state = of({ a: 1, b: 2 });
    state.pipe(excludeKeys(['a', 'b'])).subscribe((result) => {
      expect(result).toEqual({});
      done();
    });
  });

  it('should preserve nested objects in non-excluded keys', (done) => {
    const state = of({ a: { nested: 1 }, b: 2 });
    state.pipe(excludeKeys(['b'])).subscribe((result) => {
      expect(result).toEqual({ a: { nested: 1 } });
      done();
    });
  });
});
