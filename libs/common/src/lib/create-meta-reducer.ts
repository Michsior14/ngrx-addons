import type { Action, ActionReducer } from '@ngrx/store';

export interface FeaturesProps {
  features: Record<string, unknown>;
}

type ActionCheck = (action: Action) => action is Action & FeaturesProps;

export const createMergeReducer =
  (actionCheck: ActionCheck) =>
  <T = unknown, V extends Action = Action>(reducer: ActionReducer<T, V>) =>
  (state: T | undefined, action: V): T => {
    let newState: T | undefined = state;
    if (actionCheck(action)) {
      const { features } = action;
      const mergedState: T = state ? { ...state } : ({} as T);
      Object.keys(features).forEach((key) => {
        mergedState[key as keyof T] = {
          ...mergedState[key as keyof T],
          ...(features[key] as T[keyof T]),
        };
      });
      newState = mergedState;
    }
    return reducer(newState, action);
  };
