import { inject, makeEnvironmentProviders, type EnvironmentProviders, type Provider, provideEnvironmentInitializer } from '@angular/core';
import { BeforeAppInit, afterAppInitProvider } from '@ngrx-addons/common';
import type { Action, ActionReducerMap } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';
import { SyncState } from './sync-state';
import type { SyncStateFeatureConfig } from './sync-state.config';
import {
  FEATURE_SYNC_STATE,
  ROOT_SYNC_STORE,
  SYNC_STATE_FEATURE_CONFIGS,
  SyncStateRootConfig,
  SyncStateStrategy,
} from './sync-state.config';
import { SyncStateFeature } from './sync-state.feature';
import { syncStateReducer } from './sync-state.meta-reducer';

export const _provideSyncStore = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action,
>(
  config: SyncStateRootConfig<T, V> = {},
): Provider[] => {
  return [
    SyncState,
    { provide: SyncStateRootConfig, useValue: config },
    {
      provide: META_REDUCERS,
      useValue: syncStateReducer,
      multi: true,
    },
    afterAppInitProvider,
    {
      provide: SyncStateStrategy,
      useExisting: config.strategy ?? BeforeAppInit,
    },
  ];
};

export const _provideSyncState = <T>(
  config: SyncStateFeatureConfig<T>,
): Provider[] => {
  return [
    { provide: SYNC_STATE_FEATURE_CONFIGS, useValue: config, multi: true },
    SyncStateFeature,
  ];
};

/**
 * Syncs the global store.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Syncing the global store
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideStore(), provideSyncStore()],
 * });
 * ```
 */
export const provideSyncStore = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ActionReducerMap<any, V>,
  V extends Action = Action,
>(
  config: SyncStateRootConfig<T, V> = {},
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    ..._provideSyncStore(config),
    {
      provide: ROOT_SYNC_STORE,
      useFactory: () => {
        inject(SyncState).addRoot();
      },
    },
    provideEnvironmentInitializer(() => {
        const initializerFn = (() => () => inject(ROOT_SYNC_STORE))();
        return initializerFn();
      }),
  ]);
};

/**
 * Syncs additional slices of state.
 * These providers cannot be used at the component level.
 *
 * @usageNotes
 *
 * ### Sync Store Features
 *
 * ```ts
 * const booksRoutes: Route[] = [
 *   {
 *     path: '',
 *     providers: [provideState('books', booksReducer), provideSyncState({ key: 'books' })],
 *     children: [
 *       { path: '', component: BookListComponent },
 *       { path: ':id', component: BookDetailsComponent },
 *     ],
 *   },
 * ];
 * ```
 */
export const provideSyncState = <T>(
  config: SyncStateFeatureConfig<T>,
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    ..._provideSyncState(config),
    {
      provide: FEATURE_SYNC_STATE,
      useFactory: () => {
        inject(SyncStateFeature).addFeatures();
      },
    },
    provideEnvironmentInitializer(() => {
        const initializerFn = (() => () => inject(FEATURE_SYNC_STATE))();
        return initializerFn();
      }),
  ]);
};
