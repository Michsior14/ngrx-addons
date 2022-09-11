import { REHYDRATE, rehydrate } from './persist-state.actions';

describe('actions', () => {
  it('rehydrate action should have rehydrate type', () => {
    expect(rehydrate({ features: {} }).type).toEqual(REHYDRATE);
  });
});
