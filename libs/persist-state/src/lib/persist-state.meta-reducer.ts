import { Action, ActionReducer } from '@ngrx/store';
import { REHYDRATE, rehydrate } from './persist-state.actions';

const isRehydrateAction = (
  action: Action
): action is ReturnType<typeof rehydrate> => action.type === REHYDRATE;

export const persistStateReducer =
  <T = unknown, V extends Action = Action>(reducer: ActionReducer<T, V>) =>
  (state: T, action: V): T => {
    let newState = state;
    if (isRehydrateAction(action)) {
      const { features } = action;
      newState = state ? { ...state } : ({} as T);
      Object.keys(features).forEach((key) => {
        newState[key as keyof T] = {
          ...state[key as keyof T],
          ...(features[key] as T[keyof T]),
        };
      });
    }
    return reducer(newState, action);
  };
