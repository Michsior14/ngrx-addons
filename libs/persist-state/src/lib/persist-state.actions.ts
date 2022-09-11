import { createAction, props } from '@ngrx/store';

export const REHYDRATE = '@ngrx-addons/persist-state/rehydrate';

// eslint-disable-next-line @ngrx/good-action-hygiene
export const rehydrate = createAction(
  REHYDRATE,
  props<{ features: Record<string, unknown> }>()
);
