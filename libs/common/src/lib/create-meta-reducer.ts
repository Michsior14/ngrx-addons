import type { Action, ActionReducer } from '@ngrx/store';

export interface FeaturesProps {
  features: Record<string, unknown>;
}

type ActionCheck = (action: Action) => action is Action & FeaturesProps;

export const createMergeReducer =
  (actionCheck: ActionCheck) =>
  <T = unknown, V extends Action = Action>(reducer: ActionReducer<T, V>) =>
  (state: T, action: V): T => {
    let newState = state;
    if (actionCheck(action)) {
      const { features } = action;
      newState = state ? { ...state } : ({} as T);
      Object.keys(features).forEach((key) => {
        newState[key as keyof T] = {
          ...newState[key as keyof T],
          ...(features[key] as T[keyof T]),
        };
      });
    }
    return reducer(newState, action);
  };
