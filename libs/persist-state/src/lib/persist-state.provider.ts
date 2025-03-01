import {
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { BeforeAppInit, afterAppInitProvider } from '@ngrx-addons/common';
import type { Action, ActionReducerMap } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';
import { PersistState } from './persist-state';
import type { PersistStateFeatureConfig } from './persist-state.config';
import {
  FEATURE_PERSIST_STATE,
  PERSIST_STATE_FEATURE_CONFIGS,
  PersistStateRootConfig,
  PersistStateStrategy,
  ROOT_PERSIST_STORE,
} from './persist-state.config';
import { PersistStateFeature } from './persist-state.feature';
import { persistStateReducer } from './persist-state.meta-reducer';

export const _providePersistStore = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action,
>(
  config: PersistStateRootConfig<T, V> = {},
): Provider[] => {
  return [
    PersistState,
    { provide: PersistStateRootConfig, useValue: config },
    {
      provide: META_REDUCERS,
      useValue: persistStateReducer,
      multi: true,
    },
    afterAppInitProvider,
    {
      provide: PersistStateStrategy,
      useExisting: config.strategy ?? BeforeAppInit,
    },
  ];
};

export const _providePersistState = <T>(
  config: PersistStateFeatureConfig<T>,
): Provider[] => {
  return [
    {
      provide: PERSIST_STATE_FEATURE_CONFIGS,
      useValue: config,
      multi: true,
    },
    PersistStateFeature,
  ];
};

/**
 * Persists the global store.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Providing the global Persist Store
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideStore(), providePersistStore()],
 * });
 * ```
 */
export const providePersistStore = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action,
>(
  config: PersistStateRootConfig<T, V> = {},
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    ..._providePersistStore(config),
    {
      provide: ROOT_PERSIST_STORE,
      useFactory: (): void => {
        inject(PersistState).addRoot();
      },
    },
    provideEnvironmentInitializer(() => {
      const initializerFn = (
        () => (): string =>
          inject(ROOT_PERSIST_STORE)
      )();
      return initializerFn();
    }),
  ]);
};

/**
 * Persists additional slices of state.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Persist Store Features
 *
 * ```ts
 * const booksRoutes: Route[] = [
 *   {
 *     path: '',
 *     providers: [provideState('books', booksReducer), providePersistState({ key: 'books' })],
 *     children: [
 *       { path: '', component: BookListComponent },
 *       { path: ':id', component: BookDetailsComponent },
 *     ],
 *   },
 * ];
 * ```
 */
export const providePersistState = <T>(
  config: PersistStateFeatureConfig<T>,
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    ..._providePersistState(config),
    {
      provide: FEATURE_PERSIST_STATE,
      useFactory: (): void => {
        inject(PersistStateFeature).addFeatures();
      },
    },
    provideEnvironmentInitializer(() => {
      const initializerFn = (
        () => (): string =>
          inject(FEATURE_PERSIST_STATE)
      )();
      return initializerFn();
    }),
  ]);
};
