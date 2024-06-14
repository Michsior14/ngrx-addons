import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import type { Action, ActionReducerMap } from '@ngrx/store';
import type { PersistStateFeatureConfig } from './persist-state.config';
import { PersistStateRootConfig } from './persist-state.config';
import { PersistStateFeatureModule } from './persist-state.feature.module';
import {
  _providePersistStore,
  _providePersistState,
} from './persist-state.provider';
import { PersistStateRootModule } from './persist-state.root.module';

@NgModule()
export class PersistStateModule {
  public static forRoot<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends ActionReducerMap<any, V>,
    V extends Action = Action,
  >(
    config: PersistStateRootConfig<T, V> = {},
  ): ModuleWithProviders<PersistStateRootModule> {
    return {
      ngModule: PersistStateRootModule,
      providers: [..._providePersistStore(config)],
    };
  }

  public static forFeature<T>(
    config: PersistStateFeatureConfig<T>,
  ): ModuleWithProviders<PersistStateFeatureModule> {
    return {
      ngModule: PersistStateFeatureModule,
      providers: [..._providePersistState(config)],
    };
  }
}
