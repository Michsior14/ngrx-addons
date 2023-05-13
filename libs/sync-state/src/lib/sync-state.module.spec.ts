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
import { SyncStateModule } from './sync-state.module';
import { SyncStateRootModule } from './sync-state.root.module';
import {
  AfterAppInit,
  BeforeAppInit,
  afterAppInitProvider,
} from '@ngrx-addons/common';

describe('SyncStateModule', () => {
  it('forRoot should return SyncStateRootModule, state and meta reducer', () => {
    let config: Parameters<(typeof SyncStateModule)['forRoot']>[0] = {
      states: [],
    };
    expect(SyncStateModule.forRoot(config)).toEqual({
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
          useExisting: BeforeAppInit,
        },
      ],
    });

    config = {
      states: [],
      strategy: AfterAppInit,
    };
    expect(SyncStateModule.forRoot(config)).toEqual({
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
          useExisting: config.strategy,
        },
      ],
    });
  });
  it('forFeature should return SyncStateFeatureModule and service', () => {
    const config = {
      key: 'key',
      states: [],
    };
    expect(SyncStateModule.forFeature(config)).toEqual({
      ngModule: SyncStateFeatureModule,
      providers: [
        { provide: SyncStateFeatureConfig, useValue: config },
        SyncStateFeature,
      ],
    });
  });
});
