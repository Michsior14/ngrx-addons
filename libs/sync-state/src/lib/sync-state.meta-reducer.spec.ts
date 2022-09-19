import { SYNC } from './sync-state.actions';
import { isSyncAction } from './sync-state.meta-reducer';

describe('isSyncAction', () => {
  it('should check if is sync action', () => {
    expect(isSyncAction({ type: 'a' })).toEqual(false);
    expect(isSyncAction({ type: SYNC })).toEqual(true);
  });
});
