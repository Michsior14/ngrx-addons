import { createMergeReducer } from '@ngrx-addons/common';
import type { Action } from '@ngrx/store';
import type { storeSyncAction } from './sync-state.actions';
import { SYNC } from './sync-state.actions';

export const isSyncAction = (
  action: Action
): action is ReturnType<typeof storeSyncAction> => action.type === SYNC;

export const syncStateReducer = createMergeReducer(isSyncAction);
