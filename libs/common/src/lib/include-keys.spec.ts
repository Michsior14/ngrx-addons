import { of } from 'rxjs';
import { includeKeys } from './include-keys';

describe('includeKeys', () => {
  it('should include keys', (done) => {
    const state = of({ a: 1, b: 2, c: 3 });
    state.pipe(includeKeys(['a'])).subscribe((result) => {
      expect(result).toEqual({ a: 1 });
      done();
    });
  });
});
