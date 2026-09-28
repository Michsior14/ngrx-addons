import type { OnDestroy } from '@angular/core';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { InitializationStrategy, isEqual } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type { Observable, ObservableInput } from 'rxjs';
import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  fromEvent,
  ignoreElements,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { storeSyncAction } from './sync-state.actions';
import type {
  SyncStateConfig,
  SyncStateFeatureConfig,
} from './sync-state.config';
import { SyncStateRootConfig, SyncStateStrategy } from './sync-state.config';

const rootSubscription = Symbol('root-sync-state');

type SyncedState<S> = Required<SyncStateConfig<S> & { key: string }>;

@Injectable()
export class SyncState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>,
> implements OnDestroy {
  private readonly store = inject<Store>(Store);
  private readonly strategy = inject<InitializationStrategy>(SyncStateStrategy);
  private readonly errorHandler = inject(ErrorHandler);

  readonly #rootConfig: SyncStateRootConfig<T>;
  readonly #features = new Map<string, { id: symbol; references: number }>();
  readonly #destroyer = new Subject<symbol>();

  constructor() {
    const rootConfig = inject<SyncStateRootConfig<T>>(SyncStateRootConfig);
    const { states, channelPrefix, ...restConfig } = rootConfig;
    const prefix = channelPrefix ? `${channelPrefix}-` : '';
    this.#rootConfig = { ...restConfig, channelPrefix: prefix, states };
  }

  public addRoot(): void {
    const merged =
      this.#rootConfig.states?.map((state) => ({
        ...this.defaultStateConfig(state.key as string),
        ...state,
        key: state.key as string,
      })) ?? [];
    this.listenOnStates(merged, rootSubscription).subscribe();
  }

  public addFeature<F>(feature: SyncStateFeatureConfig<F>): void {
    const existing = this.#features.get(feature.key);
    if (existing) {
      existing.references++;
      return;
    }

    const subscriptionId = Symbol(feature.key);
    this.#features.set(feature.key, { id: subscriptionId, references: 1 });
    const merged = feature.states.map((state) => ({
      ...this.defaultStateConfig<F>(feature.key),
      ...state,
      key: feature.key,
    }));

    this.listenOnStates(merged, subscriptionId).subscribe();
  }

  public removeFeature(key: string): void {
    const feature = this.#features.get(key);
    if (!feature) {
      return;
    }

    if (feature.references > 1) {
      feature.references--;
      return;
    }

    this.#destroyer.next(feature.id);
    this.#features.delete(key);
  }

  public ngOnDestroy(): void {
    for (const feature of this.#features.values()) {
      this.#destroyer.next(feature.id);
    }
    this.#features.clear();
    this.#destroyer.next(rootSubscription);
    this.#destroyer.complete();
  }

  private defaultStateConfig<S>(key: string): Required<SyncStateConfig<S>> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channel: `${this.#rootConfig.channelPrefix!}${key}@store`,
      source: (state) => state,
      runGuard: () =>
        typeof window !== 'undefined' &&
        typeof window.BroadcastChannel !== 'undefined',
      skip: 1,
    };
  }

  private listenOnStates<S>(
    states: SyncedState<S>[],
    subscription: symbol,
  ): Observable<unknown> {
    if (states.length === 0) {
      return of(undefined);
    }

    return merge(
      ...states.map((state) =>
        state.runGuard()
          ? this.syncWhen(() => this.sync(state)).pipe(
              catchError((error: unknown) => {
                this.errorHandler.handleError(error);
                return EMPTY;
              }),
            )
          : of(undefined),
      ),
    ).pipe(
      takeUntil(
        this.#destroyer.pipe(filter((destroyed) => destroyed === subscription)),
      ),
    );
  }

  private sync<S>(state: SyncedState<S>): Observable<unknown> {
    const channel = new BroadcastChannel(state.channel);
    const storeSlice = this.store.pipe(
      map((storeState) => storeState[state.key as keyof typeof storeState]),
    );

    let skipCounter = 0;
    let applyingReceivedState = false;
    let receivedSlice: { value: unknown } | undefined;
    return merge(
      // Must be subscribed before the source to see each change first
      storeSlice.pipe(
        tap((slice) => {
          if (applyingReceivedState) {
            receivedSlice = { value: slice };
          } else if (receivedSlice && receivedSlice.value !== slice) {
            receivedSlice = undefined;
          }
        }),
        ignoreElements(),
      ),
      // Sync state from another tab
      fromEvent<MessageEvent<unknown>>(channel, 'message').pipe(
        tap(({ data }) => {
          applyingReceivedState = true;
          this.store.dispatch(
            storeSyncAction({ features: { [state.key]: data } }),
          );
          applyingReceivedState = false;
        }),
      ),
      // Sync state to another tab
      state.source(storeSlice).pipe(
        filter((value: Partial<S> | undefined) => value !== undefined),
        distinctUntilChanged(isEqual),
        tap((value) => {
          if (receivedSlice || ++skipCounter <= state.skip) {
            return;
          }

          try {
            channel.postMessage(value);
          } catch (error) {
            this.errorHandler.handleError(error);
          }
        }),
      ),
    ).pipe(
      finalize(() => {
        channel.close();
      }),
    );
  }

  private syncWhen<T>(input: () => ObservableInput<T>): Observable<T> {
    return this.strategy.when().pipe(switchMap(() => input()));
  }
}
