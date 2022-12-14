import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';
import type { Action, ActionReducerMap } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';
import { PersistState } from './persist-state';
import {
  PersistStateFeatureConfig,
  PersistStateRootConfig,
} from './persist-state.config';
import { PersistStateFeature } from './persist-state.feature';
import { PersistStateFeatureModule } from './persist-state.feature.module';
import { persistStateReducer } from './persist-state.meta-reducer';
import { PersistStateRootModule } from './persist-state.root.module';

@NgModule()
export class PersistStateModule {
  public static forRoot<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends ActionReducerMap<any, V>,
    V extends Action = Action
  >(
    config: PersistStateRootConfig<T, V>
  ): ModuleWithProviders<PersistStateRootModule> {
    return {
      ngModule: PersistStateRootModule,
      providers: [
        PersistState,
        { provide: PersistStateRootConfig, useValue: config },
        {
          provide: META_REDUCERS,
          useValue: persistStateReducer,
          multi: true,
        },
      ],
    };
  }

  public static forFeature<T>(
    config: PersistStateFeatureConfig<T>
  ): ModuleWithProviders<PersistStateFeatureModule<T>> {
    return {
      ngModule: PersistStateFeatureModule,
      providers: [
        { provide: PersistStateFeatureConfig, useValue: config },
        PersistStateFeature,
      ],
    };
  }
}
