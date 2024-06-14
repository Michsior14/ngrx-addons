import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import type { Action, ActionReducerMap } from '@ngrx/store';
import type { SyncStateFeatureConfig } from './sync-state.config';
import { SyncStateRootConfig } from './sync-state.config';
import { SyncStateFeatureModule } from './sync-state.feature.module';
import { _provideSyncState, _provideSyncStore } from './sync-state.provider';
import { SyncStateRootModule } from './sync-state.root.module';

@NgModule()
export class SyncStateModule {
  public static forRoot<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends ActionReducerMap<any, V>,
    V extends Action = Action,
  >(
    config: SyncStateRootConfig<T, V> = {},
  ): ModuleWithProviders<SyncStateRootModule> {
    return {
      ngModule: SyncStateRootModule,
      providers: [..._provideSyncStore(config)],
    };
  }

  public static forFeature<T>(
    config: SyncStateFeatureConfig<T>,
  ): ModuleWithProviders<SyncStateFeatureModule> {
    return {
      ngModule: SyncStateFeatureModule,
      providers: [..._provideSyncState(config)],
    };
  }
}
