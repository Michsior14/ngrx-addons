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
  storage: StateStorage | (() => StateStorage);
  storageKey?: string;
  source?: (store: Observable<S>) => Observable<Partial<S>>;
  runGuard?: () => boolean;
}

export interface PersistStateRoot<T, K extends keyof T, S = T[K] extends AnyFunction ? State<T[K]> : never>
  extends PersistStateConfig<S> {
  key: K;
}

type PersistStateRootTyped<T> = { [K in keyof T]: PersistStateRoot<T, K> }[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class PersistStateRootConfig<T extends ActionReducerMap<any, V>, V extends Action = Action> {
  public abstract readonly states: PersistStateRootTyped<T>[];
  public abstract readonly storageKeyPrefix?: string;
}

export abstract class PersistStateFeatureConfig<T> {
  public abstract readonly states: PersistStateConfig<T>[];
  public abstract readonly key: string;
}
