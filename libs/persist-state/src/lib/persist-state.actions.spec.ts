import {
  REHYDRATE,
  rehydrate,
  storeRehydrateAction,
} from './persist-state.actions';

describe('persist-state.actions', () => {
  describe('rehydrate', () => {
    it('should have REHYDRATE type', () => {
      expect(rehydrate({ features: {} }).type).toEqual(REHYDRATE);
    });

    it('should include features in the action', () => {
      const features = { test: { value: 1 } };
      const action = rehydrate({ features });
      expect(action.features).toEqual(features);
    });
  });

  describe('storeRehydrateAction', () => {
    it('should have REHYDRATE type', () => {
      expect(storeRehydrateAction({ features: {} }).type).toEqual(REHYDRATE);
    });

    it('should be the same as rehydrate', () => {
      expect(storeRehydrateAction).toBe(rehydrate);
    });
  });
});
