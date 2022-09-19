import { FeaturesProps } from '@ngrx-addons/common';
import { createAction, props } from '@ngrx/store';

export const REHYDRATE = '@ngrx-addons/persist-state/rehydrate';

export const storeRehydrateAction = createAction(
  REHYDRATE,
  // eslint-disable-next-line @ngrx/prefer-inline-action-props
  props<FeaturesProps>()
);

export const rehydrate = storeRehydrateAction;
