import { createMergeReducer } from '@ngrx-addons/common';
import type { Action } from '@ngrx/store';
import type { rehydrate } from './persist-state.actions';
import { REHYDRATE } from './persist-state.actions';

export const isRehydrateAction = (
  action: Action
): action is ReturnType<typeof rehydrate> => action.type === REHYDRATE;

export const persistStateReducer = createMergeReducer(isRehydrateAction);
