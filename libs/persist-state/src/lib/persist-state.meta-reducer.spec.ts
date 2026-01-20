import { REHYDRATE, rehydrate } from './persist-state.actions';
import {
  isRehydrateAction,
  persistStateReducer,
} from './persist-state.meta-reducer';

describe('persist-state.meta-reducer', () => {
  describe('isRehydrateAction', () => {
    it('should return false for non-rehydrate actions', () => {
      expect(isRehydrateAction({ type: 'a' })).toEqual(false);
      expect(isRehydrateAction({ type: 'SOME_OTHER_ACTION' })).toEqual(false);
    });

    it('should return true for rehydrate actions', () => {
      expect(isRehydrateAction({ type: REHYDRATE })).toEqual(true);
      expect(isRehydrateAction(rehydrate({ features: {} }))).toEqual(true);
    });
  });

  describe('persistStateReducer', () => {
    const mockReducer = jest.fn(
      (
        state: Record<string, unknown> | undefined,
        _action,
      ): Record<string, unknown> => state ?? {},
    );

    beforeEach(() => {
      mockReducer.mockClear();
    });

    it('should pass through non-rehydrate actions without modification', () => {
      const state = { feature: { value: 1 } };
      const action = { type: 'SOME_ACTION' };
      const wrappedReducer = persistStateReducer(mockReducer);

      wrappedReducer(state, action);

      expect(mockReducer).toHaveBeenCalledWith(state, action);
    });

    it('should merge rehydrated state into existing state', () => {
      const state = { feature: { value: 1, other: 2 } };
      const action = rehydrate({ features: { feature: { value: 10 } } });
      const wrappedReducer = persistStateReducer(mockReducer);

      wrappedReducer(state, action);

      expect(mockReducer).toHaveBeenCalledWith(
        { feature: { value: 10, other: 2 } },
        action,
      );
    });

    it('should handle undefined state during rehydration', () => {
      const action = rehydrate({ features: { feature: { value: 10 } } });
      const wrappedReducer = persistStateReducer(mockReducer);

      wrappedReducer(undefined, action);

      expect(mockReducer).toHaveBeenCalledWith(
        { feature: { value: 10 } },
        action,
      );
    });

    it('should merge multiple features', () => {
      const state = { featureA: { a: 1 }, featureB: { b: 2 } };
      const action = rehydrate({
        features: { featureA: { a: 10 }, featureC: { c: 3 } },
      });
      const wrappedReducer = persistStateReducer(mockReducer);

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
