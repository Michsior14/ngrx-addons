import { createMergeReducer } from '@ngrx-addons/common';
import { Action } from '@ngrx/store';
import { storeSyncAction, SYNC } from './sync-state.actions';

export const isSyncAction = (
  action: Action
): action is ReturnType<typeof storeSyncAction> => action.type === SYNC;

export const syncStateReducer = createMergeReducer(isSyncAction);
