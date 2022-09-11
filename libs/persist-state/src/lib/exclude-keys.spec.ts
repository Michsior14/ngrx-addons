import { of } from 'rxjs';
import { excludeKeys } from './exclude-keys';

describe('excludeKeys', () => {
  it('should exclude keys', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(excludeKeys(['a'])).subscribe((result) => {
      expect(result).toEqual({ b: 2, c: 3 });
      done();
    });
  });
});
