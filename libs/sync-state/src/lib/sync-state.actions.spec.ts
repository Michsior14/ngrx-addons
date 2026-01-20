import { SYNC, storeSyncAction } from './sync-state.actions';

describe('sync-state.actions', () => {
  describe('storeSyncAction', () => {
    it('should have SYNC type', () => {
      expect(storeSyncAction({ features: {} }).type).toEqual(SYNC);
    });

    it('should include features in the action', () => {
      const features = { test: { value: 1 } };
      const action = storeSyncAction({ features });
      expect(action.features).toEqual(features);
    });
  });
});
