import { REHYDRATE } from './persist-state.actions';
import { isRehydrateAction } from './persist-state.meta-reducer';

describe('isRehydrateAction', () => {
  it('should check if is rehydrate action', () => {
    expect(isRehydrateAction({ type: 'a' })).toEqual(false);
    expect(isRehydrateAction({ type: REHYDRATE })).toEqual(true);
  });
});
