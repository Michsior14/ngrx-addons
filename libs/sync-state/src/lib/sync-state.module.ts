import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import { BeforeAppInit, afterAppInitProvider } from '@ngrx-addons/common';
import type { Action, ActionReducerMap } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';
import { SyncState } from './sync-state';
import {
  SyncStateFeatureConfig,
  SyncStateRootConfig,
  SyncStateStrategy,
} from './sync-state.config';
import { SyncStateFeature } from './sync-state.feature';
import { SyncStateFeatureModule } from './sync-state.feature.module';
import { syncStateReducer } from './sync-state.meta-reducer';
import { SyncStateRootModule } from './sync-state.root.module';

@NgModule()
export class SyncStateModule {
  public static forRoot<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends ActionReducerMap<any, V>,
    V extends Action = Action
  >(
    config: SyncStateRootConfig<T, V> = {}
  ): ModuleWithProviders<SyncStateRootModule> {
    return {
      ngModule: SyncStateRootModule,
      providers: [
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
      ],
    };
  }

  public static forFeature<T>(
    config: SyncStateFeatureConfig<T>
  ): ModuleWithProviders<SyncStateFeatureModule<T>> {
    return {
      ngModule: SyncStateFeatureModule,
      providers: [
        { provide: SyncStateFeatureConfig, useValue: config },
        SyncStateFeature,
      ],
    };
  }
}
