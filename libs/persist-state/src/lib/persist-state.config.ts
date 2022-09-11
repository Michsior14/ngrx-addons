import { Action, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StateStorage } from './storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

type State<T extends AnyFunction> = Writable<NonNullable<Parameters<T>[0]>>;

export interface PersistStateConfig<S> {
  /**
   * An object or function resolving to an object with async setItem,
   * getItem and removeItem methods for storing the state
   */
  storage: StateStorage | (() => StateStorage);
  /**
   * The name under which the store state is saved.
   *
   * @default the prefix plus store name plus a `@store` suffix
   */
  storageKey?: string;
  /**
   * A method that receives the observable of a state and return what to save from it.
   *
   * @default (state) => state
   */
  source?: (store: Observable<S>) => Observable<Partial<S>>;
  /**
   * Returns whether the actual implementation should be run.
   *
   * @default () => typeof window !== 'undefined'
   */
  runGuard?: () => boolean;
  /**
   * The number of state changes skipped before the state is persisted.
   * Used to skip the initial state change.
   *
   * @default 1
   */
  skip?: number;
}

export interface PersistStateRoot<
  T,
  K extends keyof T,
  S = T[K] extends AnyFunction ? State<T[K]> : never
> extends PersistStateConfig<S> {
  /**
   * The name of a store slice to persist.
   */
  key: K;
}

type PersistStateRootTyped<T> = {
  [K in keyof T]: PersistStateRoot<T, K>;
}[keyof T];

export abstract class PersistStateRootConfig<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action
> {
  /**
   * The list of states to persist.
   */
  public abstract readonly states: PersistStateRootTyped<T>[];
  /**
   * The storage key prefix.
   */
  public abstract readonly storageKeyPrefix?: string;
}

export abstract class PersistStateFeatureConfig<T> {
  /**
   * The list of states to persist.
   */
  public abstract readonly states: PersistStateConfig<T>[];
  /**
   * The name of a feature to persist.
   */
  public abstract readonly key: string;
}
