import type { Action } from '@ngrx/store';
import { createAction, props } from '@ngrx/store';
import type { FeaturesProps } from './create-meta-reducer';
import { createMergeReducer } from './create-meta-reducer';

describe('createMergeReducer', () => {
  const merge = 'MERGE';
  const reducer = createMergeReducer(
    (action: Action): action is FeaturesProps & Action =>
      action.type === 'MERGE',
  );
  // eslint-disable-next-line @ngrx/prefer-inline-action-props
  const mergeAction = createAction(merge, props<FeaturesProps>());

  it('should passthrough non features actions', (done) => {
    const state = { a: 1, b: 2, c: 3 };
    const action = { type: 'SOME_ACTION' };
    reducer((currentState, currentAction) => {
      expect(currentState).toEqual(state);
      expect(currentAction).toEqual(action);
      done();
    })(state, action);
  });

  it('should merge states on features action', (done) => {
    const state = { override: { b: 2 }, add: { a: 1 }, keep: { c: 3 } };
    const toMerge = { override: { b: 1 }, add: { b: 1 } };
    const action = mergeAction({ features: toMerge });

    reducer((currentState, currentAction) => {
      expect(currentState).toEqual({
        override: { b: 1 },
        add: { a: 1, b: 1 },
        keep: { c: 3 },
      });
      expect(currentAction).toEqual(action);
      done();
    })(state, action);
  });

  it('should merge states on features action and empty state', (done) => {
    const state = undefined;
    const toMerge = { override: { b: 1 }, add: { b: 1 } };
    const action = mergeAction({ features: toMerge });

    reducer((currentState, currentAction) => {
      expect(currentState).toEqual({
        override: { b: 1 },
        add: { b: 1 },
      });
      expect(currentAction).toEqual(action);
      done();
    })(state, action);
  });

  it('should replace array-valued feature state without converting it to an object', (done) => {
    const state = { items: [1, 2] };
    const action = mergeAction({ features: { items: [3] } });

    reducer((currentState) => {
      expect(currentState).toEqual({ items: [3] });
      done();
    })(state, action);
  });

  it('should replace primitive and null feature states', (done) => {
    const state = { counter: 1, theme: 'light', user: { id: 1 } };
    const action = mergeAction({
      features: { counter: 5, theme: 'dark', user: null },
    });

    reducer((currentState) => {
      expect(currentState).toEqual({ counter: 5, theme: 'dark', user: null });
      done();
    })(state, action);
  });

  it('should replace a non-object feature state with an object', (done) => {
    const state = { items: [1, 2], theme: 'light' };
    const action = mergeAction({
      features: { items: { a: 1 }, theme: { b: 1 } },
    });

    reducer((currentState) => {
      expect(currentState).toEqual({ items: { a: 1 }, theme: { b: 1 } });
      done();
    })(state, action);
  });

  it('should keep the feature state if the incoming value is undefined', (done) => {
    const state = { keep: { a: 1 } };
    const action = mergeAction({ features: { keep: undefined } });

    reducer((currentState) => {
      expect(currentState).toEqual({ keep: { a: 1 } });
      done();
    })(state, action);
  });
});
