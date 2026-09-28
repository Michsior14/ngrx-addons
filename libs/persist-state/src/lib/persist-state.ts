import type { OnDestroy } from '@angular/core';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { InitializationStrategy, isEqual } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type {
  Observable,
  ObservableInput,
  ObservedValueOf,
  OperatorFunction,
} from 'rxjs';
import {
  EMPTY,
  Subject,
  catchError,
  defaultIfEmpty,
  defer,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  of,
  skip,
  switchMap,
  take,
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

const rootSubscription = Symbol('root-persist-state');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StateSlice = Record<string, any>;

type PersistedState<S> = Required<PersistStateConfig<S> & { key: string }>;

@Injectable()
export class PersistState<
  T extends ActionReducerMap<unknown> = ActionReducerMap<unknown>,
> implements OnDestroy {
  private readonly store = inject<Store>(Store);
  private readonly strategy =
    inject<InitializationStrategy>(PersistStateStrategy);
  private readonly errorHandler = inject(ErrorHandler);

  readonly #rootConfig: PersistStateRootConfig<T>;
  readonly #features = new Map<string, { id: symbol; references: number }>();
  readonly #destroyer = new Subject<symbol>();

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
    this.listenOnStates(merged, rootSubscription).subscribe();
  }

  public addFeature<F>(feature: PersistStateFeatureConfig<F>): void {
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
    states: PersistedState<S>[],
    subscription: symbol,
  ): Observable<unknown> {
    if (states.length === 0) {
      return of(undefined);
    }

    return merge(
      ...states.map((state) =>
        state.runGuard() ? this.persist(state) : of(undefined),
      ),
    ).pipe(
      takeUntil(
        this.#destroyer.pipe(filter((destroyed) => destroyed === subscription)),
      ),
    );
  }

  private persist<S>(state: PersistedState<S>): Observable<unknown> {
    const storage =
      typeof state.storage === 'function' ? state.storage() : state.storage;

    const restore = this.rehydrateWhen(() =>
      from(storage.getItem(state.storageKey)).pipe(defaultIfEmpty(null)),
    ).pipe(
      take(1),
      tap((value) => {
        if (value === null || value === undefined) {
          return;
        }

        // Run migrations if defined
        const restored = state.migrations.length
          ? this.runMigrations(value, state.migrations)
          : value;

        this.store.dispatch(rehydrate({ features: { [state.key]: restored } }));
      }),
    );

    const save = state
      .source(
        this.store.pipe(
          map((storeState) => storeState[state.key as keyof typeof storeState]),
        ),
      )
      .pipe(
        filter((value: Partial<S> | undefined) => value !== undefined),
        distinctUntilChanged(isEqual),
        skip(state.skip),
        switchMap((value) =>
          defer(() => storage.setItem(state.storageKey, value)).pipe(
            this.handleError(),
          ),
        ),
      );

    // Saving starts only after the stored state is restored
    return restore.pipe(
      switchMap(() => save),
      this.handleError(),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError<T, O extends ObservableInput<any>>(): OperatorFunction<
    T,
    T | ObservedValueOf<O>
  > {
    return catchError((error: unknown) => {
      this.errorHandler.handleError(error);
      return EMPTY;
    });
  }
}
