import { SYNC, storeSyncAction } from './sync-state.actions';
import { isSyncAction, syncStateReducer } from './sync-state.meta-reducer';

describe('sync-state.meta-reducer', () => {
  describe('isSyncAction', () => {
    it('should return false for non-sync actions', () => {
      expect(isSyncAction({ type: 'a' })).toEqual(false);
      expect(isSyncAction({ type: 'SOME_OTHER_ACTION' })).toEqual(false);
    });

    it('should return true for sync actions', () => {
      expect(isSyncAction({ type: SYNC })).toEqual(true);
      expect(isSyncAction(storeSyncAction({ features: {} }))).toEqual(true);
    });
  });

  describe('syncStateReducer', () => {
    const mockReducer = jest.fn(
      (
        state: Record<string, unknown> | undefined,
        _action,
      ): Record<string, unknown> => state ?? {},
    );

    beforeEach(() => {
      mockReducer.mockClear();
    });

    it('should pass through non-sync actions without modification', () => {
      const state = { feature: { value: 1 } };
      const action = { type: 'SOME_ACTION' };
      const wrappedReducer = syncStateReducer(mockReducer);

      wrappedReducer(state, action);

      expect(mockReducer).toHaveBeenCalledWith(state, action);
    });

    it('should merge synced state into existing state', () => {
      const state = { feature: { value: 1, other: 2 } };
      const action = storeSyncAction({ features: { feature: { value: 10 } } });
      const wrappedReducer = syncStateReducer(mockReducer);

      wrappedReducer(state, action);

      expect(mockReducer).toHaveBeenCalledWith(
        { feature: { value: 10, other: 2 } },
        action,
      );
    });

    it('should handle undefined state during sync', () => {
      const action = storeSyncAction({ features: { feature: { value: 10 } } });
      const wrappedReducer = syncStateReducer(mockReducer);

      wrappedReducer(undefined, action);

      expect(mockReducer).toHaveBeenCalledWith(
        { feature: { value: 10 } },
        action,
      );
    });

    it('should merge multiple features', () => {
      const state = { featureA: { a: 1 }, featureB: { b: 2 } };
      const action = storeSyncAction({
        features: { featureA: { a: 10 }, featureC: { c: 3 } },
      });
      const wrappedReducer = syncStateReducer(mockReducer);

      wrappedReducer(state, action);

      expect(mockReducer).toHaveBeenCalledWith(
        {
          featureA: { a: 10 },
          featureB: { b: 2 },
          featureC: { c: 3 },
        },
        action,
      );
    });
  });
});
