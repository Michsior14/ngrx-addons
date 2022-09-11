import { Injectable, OnDestroy } from '@angular/core';
import { ActionReducerMap, Store } from '@ngrx/store';
import {
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  NEVER,
  Observable,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { rehydrate } from './persist-state.actions';
import {
  PersistStateConfig,
  PersistStateFeatureConfig,
  PersistStateRootConfig,
} from './persist-state.config';
import { isEqual } from './persist-state.utils';

const rootState = 'root' as const;

@Injectable()
export class PersistState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>
> implements OnDestroy
{
  #rootConfig: PersistStateRootConfig<T>;
  #features = new Map<string, boolean>();
  #destroyer = new Subject<string>();

  constructor(
    private readonly store: Store,
    rootConfig: PersistStateRootConfig<T>
  ) {
    const { states, storageKeyPrefix, ...restConfig } = rootConfig;
    const keyPrefix = storageKeyPrefix ? `${storageKeyPrefix}-` : '';
    this.#rootConfig = { ...restConfig, storageKeyPrefix: keyPrefix, states };
  }

  public addRoot(): void {
    const merged = this.#rootConfig.states.map((state) => ({
      ...this.defaultStateConfig(state.key as string),
      ...state,
      key: state.key as string,
    }));
    this.listenOnStates(merged, rootState).subscribe();
  }

  public addFeature<F>(feature: PersistStateFeatureConfig<F>): void {
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
    this.#features.forEach((_, key) => this.#destroyer.next(key));
    this.#features.clear();
    this.#destroyer.next(rootState);
    this.#destroyer.complete();
  }

  private defaultStateConfig<S>(
    key: string
  ): Required<Omit<PersistStateConfig<S>, 'storage'>> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      storageKey: `${this.#rootConfig.storageKeyPrefix!}${key}@store`,
      source: (state) => state,
      runGuard: () => typeof window !== 'undefined',
      skip: 1,
    };
  }

  private listenOnStates<S>(
    states: Required<PersistStateConfig<S> & { key: string }>[],
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
        const storage =
          typeof state.storage === 'function' ? state.storage() : state.storage;
        return merge(
          // Restore state from storage
          from(storage.getItem(state.storageKey)).pipe(
            filter((value) => !!value),
            tap((value) =>
              this.store.dispatch(
                rehydrate({ features: { [state.key]: value } })
              )
            )
          ),
          // Save state to storage
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
              switchMap((value) => storage.setItem(state.storageKey, value))
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
}
