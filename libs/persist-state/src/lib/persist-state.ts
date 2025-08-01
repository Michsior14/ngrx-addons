import type { OnDestroy } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { InitializationStrategy, isEqual } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type { Observable, ObservableInput } from 'rxjs';
import {
  Subject,
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  of,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { rehydrate } from './persist-state.actions';
import type {
  PersistStateConfig,
  PersistStateFeatureConfig,
} from './persist-state.config';
import {
  PersistStateRootConfig,
  PersistStateStrategy,
} from './persist-state.config';

const rootState = 'root';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StateSlice = Record<string, any>;

@Injectable()
export class PersistState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>,
> implements OnDestroy
{
  private readonly store = inject<Store>(Store);
  private readonly strategy =
    inject<InitializationStrategy>(PersistStateStrategy);

  readonly #rootConfig: PersistStateRootConfig<T>;
  readonly #features = new Map<string, boolean>();
  readonly #destroyer = new Subject<string>();

  constructor() {
    const rootConfig = inject<PersistStateRootConfig<T>>(
      PersistStateRootConfig,
    );

    const { states, storageKeyPrefix, ...restConfig } = rootConfig;
    const keyPrefix = storageKeyPrefix ? `${storageKeyPrefix}-` : '';
    this.#rootConfig = { ...restConfig, storageKeyPrefix: keyPrefix, states };
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
    this.#features.forEach((_, key) => {
      this.removeFeature(key);
    });
    this.#destroyer.next(rootState);
    this.#destroyer.complete();
  }

  private defaultStateConfig<S>(
    key: string,
  ): Required<Omit<PersistStateConfig<S>, 'storage'>> {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      storageKey: `${this.#rootConfig.storageKeyPrefix!}${key}@store`,
      source: (state) => state,
      runGuard: () => typeof window !== 'undefined',
      migrations: [],
      skip: 1,
    };
  }

  private listenOnStates<S>(
    states: Required<PersistStateConfig<S> & { key: string }>[],
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
        const storage =
          typeof state.storage === 'function' ? state.storage() : state.storage;
        return merge(
          // Restore state from storage
          this.rehydrateWhen(() =>
            from(storage.getItem(state.storageKey)),
          ).pipe(
            filter((value): value is StateSlice => !!value),
            tap((value) => {
              // Run migrations if defined
              if (state.migrations.length) {
                value = this.runMigrations(value, state.migrations);
              }

              this.store.dispatch(
                rehydrate({ features: { [state.key]: value } }),
              );
            }),
            defaultIfEmpty(undefined),
          ),
          // Save state to storage
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
              skip(state.skip),
              switchMap((value) => storage.setItem(state.storageKey, value)),
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

  private runMigrations<S>(
    value: StateSlice,
    migrations: Required<PersistStateConfig<S>>['migrations'],
  ): StateSlice {
    migrations.forEach((migration) => {
      const version = value[
        (migration.versionKey ?? 'version') as keyof typeof value
      ] as string | number | undefined;
      if (migration.version === version) {
        value = migration.migrate(value) as typeof value;
      }
    });
    return value;
  }

  private rehydrateWhen<T>(input: () => ObservableInput<T>): Observable<T> {
    return this.strategy.when().pipe(switchMap(() => input()));
  }
}
