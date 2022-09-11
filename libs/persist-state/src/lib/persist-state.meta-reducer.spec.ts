import { rehydrate } from './persist-state.actions';
import { persistStateReducer } from './persist-state.meta-reducer';

describe('persistStateReducer', () => {
  it('should passthrough non rehydrate actions', (done) => {
    const state = { a: 1, b: 2, c: 3 };
    const action = { type: 'SOME_ACTION' };
    persistStateReducer((currentState, currentAction) => {
      expect(currentState).toEqual(state);
      expect(currentAction).toEqual(action);
      done();
    })(state, action);
  });

  it('should merge states on rehydrate action', (done) => {
    const state = { override: { b: 2 }, add: { a: 1 }, keep: { c: 3 } };
    const toMerge = { override: { b: 1 }, add: { b: 1 } };
    const action = rehydrate({ features: toMerge });

    persistStateReducer((currentState, currentAction) => {
      expect(currentState).toEqual({
        override: { b: 1 },
        add: { a: 1, b: 1 },
        keep: { c: 3 },
      });
      expect(currentAction).toEqual(action);
      done();
    })(state, action);
  });
});
