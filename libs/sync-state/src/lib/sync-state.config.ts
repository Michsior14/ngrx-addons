import { InjectionToken } from '@angular/core';
import type {
  AnyFunction,
  InitializationStrategy,
  State,
} from '@ngrx-addons/common';
import type { Action, ActionReducerMap } from '@ngrx/store';
import type { Observable } from 'rxjs';

export interface SyncStateConfig<S> {
  /**
   * The name under which the store state is sync via BroadcastChannel.
   *
   * @default the prefix plus store name plus a `@store` suffix
   */
  channel?: string;
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

export interface SyncStateRoot<
  T,
  K extends keyof T,
  S = T[K] extends AnyFunction ? State<T[K]> : never,
> extends SyncStateConfig<S> {
  /**
   * The name of a store slice to persist.
   */
  key: K;
}

type SyncStateRootTyped<T> = {
  [K in keyof T]: SyncStateRoot<T, K>;
}[keyof T];

export abstract class SyncStateRootConfig<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action,
> {
  /**
   * The list of states to persist.
   */
  public abstract readonly states?: SyncStateRootTyped<T>[];
  /**
   * The channel prefix.
   */
  public abstract readonly channelPrefix?: string;
  /**
   * The strategy used on application startup to sync the state.
   *
   * @default BeforeAppInit
   */
  public abstract readonly strategy?: typeof InitializationStrategy;
}

export abstract class SyncStateFeatureConfig<T> {
  /**
   * The list of states to persist.
   */
  public abstract readonly states: SyncStateConfig<T>[];
  /**
   * The name of a feature to persist.
   */
  public abstract readonly key: string;
}

/**
 * Injection token for the strategy used to initialize the state.
 */
export const SyncStateStrategy = new InjectionToken<InitializationStrategy>(
  'sync-state-init-strategy',
);

/**
 * Injection token for the list of states to sync.
 */
export const SYNC_STATE_FEATURE_CONFIGS = new InjectionToken<
  SyncStateFeatureConfig<unknown>[]
>('sync-state-feature-configs');

export const ROOT_SYNC_STORE = new InjectionToken<string>('sync-state-root');

export const FEATURE_SYNC_STATE = new InjectionToken<string>(
  'sync-state-feature',
);
