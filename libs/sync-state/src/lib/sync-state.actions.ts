import { FeaturesProps } from '@ngrx-addons/common';
import { createAction, props } from '@ngrx/store';

export const SYNC = '@ngrx-addons/sync-state/sync';

// eslint-disable-next-line @ngrx/prefer-inline-action-props
export const storeSyncAction = createAction(SYNC, props<FeaturesProps>());
