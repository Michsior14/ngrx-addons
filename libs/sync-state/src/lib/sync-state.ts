import type { OnDestroy } from '@angular/core';
import { Inject, Injectable } from '@angular/core';
import { InitializationStrategy, isEqual } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type { Observable, ObservableInput } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  fromEvent,
  map,
  merge,
  NEVER,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { storeSyncAction } from './sync-state.actions';
import type {
  SyncStateConfig,
  SyncStateFeatureConfig,
} from './sync-state.config';
import { SyncStateStrategy, SyncStateRootConfig } from './sync-state.config';

const rootState = 'root' as const;

@Injectable()
export class SyncState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>
> implements OnDestroy
{
  #rootConfig: SyncStateRootConfig<T>;
  #features = new Map<string, boolean>();
  #destroyer = new Subject<string>();

  constructor(
    private readonly store: Store,
    @Inject(SyncStateStrategy)
    private readonly strategy: InitializationStrategy,
    rootConfig: SyncStateRootConfig<T>
  ) {
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
    this.#features.forEach((_, key) => { this.removeFeature(key); });
    this.#destroyer.next(rootState);
    this.#destroyer.complete();
  }

  private defaultStateConfig<S>(key: string): Required<SyncStateConfig<S>> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channel: `${this.#rootConfig.channelPrefix!}${key}@store`,
      source: (state) => state,
      runGuard: () =>
        typeof window.BroadcastChannel !== 'undefined',
      skip: 1,
    };
  }

  private listenOnStates<S>(
    states: Required<SyncStateConfig<S> & { key: string }>[],
    feature: string
  ): Observable<unknown> {
    if (states.length === 0) {
      return NEVER;
    }

    return merge(
      ...states.map((state) => {
        if (!state.runGuard()) {
          return NEVER;
        }

        const stateChannel = new BroadcastChannel(state.channel);
        let canBePosted = true;

        return merge(
          // Sync state from another tab
          this.syncWhen(() =>
            fromEvent<MessageEvent<unknown>>(stateChannel, 'message')
          ).pipe(
            tap(({ data }) => {
              canBePosted = false;
              this.store.dispatch(
                storeSyncAction({ features: { [state.key]: data } })
              );
            })
          ),
          // Sync state to another tab
          state
            .source(
              this.store.pipe(
                map(
                  (storeState) =>
                    storeState[state.key as keyof typeof storeState]
                )
              )
            )
            .pipe(
              distinctUntilChanged(isEqual),
              skip(state.skip),
              tap((value) => {
                if (canBePosted) {
                  stateChannel.postMessage(value);
                } else {
                  canBePosted = true;
                }
              }),
              finalize(() => { stateChannel.close(); })
            )
        );
      })
    ).pipe(
      takeUntil(
        this.#destroyer.pipe(
          filter((destroyFeature) => destroyFeature === feature)
        )
      )
    );
  }

  private syncWhen<T>(input: () => ObservableInput<T>) {
    return this.strategy.when().pipe(switchMap(() => input()));
  }
}
