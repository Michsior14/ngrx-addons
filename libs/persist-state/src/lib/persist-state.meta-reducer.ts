import { createMergeReducer } from '@ngrx-addons/common';
import { Action } from '@ngrx/store';
import { REHYDRATE, rehydrate } from './persist-state.actions';

export const isRehydrateAction = (
  action: Action
): action is ReturnType<typeof rehydrate> => action.type === REHYDRATE;

export const persistStateReducer = createMergeReducer(isRehydrateAction);
