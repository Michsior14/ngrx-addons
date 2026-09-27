import type { Action, ActionReducer } from '@ngrx/store';

export interface FeaturesProps {
  features: Record<string, unknown>;
}

type ActionCheck = (action: Action) => action is Action & FeaturesProps;

const isMergeable = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const createMergeReducer =
  (actionCheck: ActionCheck) =>
  <T = unknown, V extends Action = Action>(reducer: ActionReducer<T, V>) =>
  (state: T | undefined, action: V): T => {
    let newState: T | undefined = state;
    if (actionCheck(action)) {
      const { features } = action;
      const mergedState = (state ? { ...state } : {}) as Record<
        string,
        unknown
      >;
      Object.keys(features).forEach((key) => {
        const incoming = features[key];
        if (incoming === undefined) {
          return;
        }

        // Only objects are merged, the rest is replaced
        const current = mergedState[key];
        mergedState[key] = isMergeable(incoming)
          ? { ...(isMergeable(current) ? current : {}), ...incoming }
          : incoming;
      });
      newState = mergedState as T;
    }
    return reducer(newState, action);
  };
