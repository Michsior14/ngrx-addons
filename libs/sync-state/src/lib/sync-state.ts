import type { OnDestroy } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { InitializationStrategy, isEqual } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type { Observable, ObservableInput } from 'rxjs';
import {
  Subject,
  distinctUntilChanged,
  filter,
  finalize,
  fromEvent,
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

const rootState = 'root';

@Injectable()
export class SyncState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>,
> implements OnDestroy
{
  private readonly store = inject<Store>(Store);
  private readonly strategy = inject<InitializationStrategy>(SyncStateStrategy);

  readonly #rootConfig: SyncStateRootConfig<T>;
  readonly #features = new Map<string, boolean>();
  readonly #destroyer = new Subject<string>();

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
    this.listenOnStates(merged, rootState).subscribe();
  }

  public addFeature<F>(feature: SyncStateFeatureConfig<F>): void {
    if (this.#features.has(feature.key)) {
      return;
    }

    // Remove in case of re-adding
    this.removeFeature(feature.key);

    this.#features.set(feature.key, true);
    const merged = feature.states.map((state) => ({
      ...this.defaultStateConfig<F>(feature.key),
      ...state,
      key: feature.key,
    }));

    this.listenOnStates(merged, feature.key).subscribe();
  }

  public removeFeature(key: string): void {
    this.#destroyer.next(key);
    this.#features.delete(key);
  }

  public ngOnDestroy(): void {
    this.#features.forEach((_, key) => {
      this.removeFeature(key);
    });
    this.#destroyer.next(rootState);
    this.#destroyer.complete();
  }

  private defaultStateConfig<S>(key: string): Required<SyncStateConfig<S>> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channel: `${this.#rootConfig.channelPrefix!}${key}@store`,
      source: (state) => state,
      runGuard: () => typeof window.BroadcastChannel !== 'undefined',
      skip: 1,
    };
  }

  private listenOnStates<S>(
    states: Required<SyncStateConfig<S> & { key: string }>[],
    feature: string,
  ): Observable<unknown> {
    if (states.length === 0) {
      return of(undefined);
    }

    return merge(
      ...states.map((state) => {
        if (!state.runGuard()) {
          return of(undefined);
        }

        const stateChannel = new BroadcastChannel(state.channel);
        let skipCounter = 0;
        let canBePosted = true;

        return this.syncWhen(() =>
          merge(
            // Sync state from another tab
            fromEvent<MessageEvent<unknown>>(stateChannel, 'message').pipe(
              tap(({ data }) => {
                canBePosted = false;
                this.store.dispatch(
                  storeSyncAction({ features: { [state.key]: data } }),
                );
              }),
            ),
            // Sync state to another tab
            state
              .source(
                this.store.pipe(
                  map(
                    (storeState) =>
                      storeState[state.key as keyof typeof storeState],
                  ),
                ),
              )
              .pipe(
                distinctUntilChanged(isEqual),
                tap((value) => {
                  if (canBePosted && ++skipCounter > state.skip) {
                    stateChannel.postMessage(value);
                  } else {
                    canBePosted = true;
                  }
                }),
                finalize(() => {
                  stateChannel.close();
                }),
              ),
          ),
        );
      }),
    ).pipe(
      takeUntil(
        this.#destroyer.pipe(
          filter((destroyFeature) => destroyFeature === feature),
        ),
      ),
    );
  }

  private syncWhen<T>(input: () => ObservableInput<T>): Observable<T> {
    return this.strategy.when().pipe(switchMap(() => input()));
  }
}
