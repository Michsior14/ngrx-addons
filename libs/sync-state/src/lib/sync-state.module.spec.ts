import { META_REDUCERS } from '@ngrx/store';
import { SyncState } from './sync-state';
import {
  SyncStateFeatureConfig,
  SyncStateRootConfig,
} from './sync-state.config';
import { SyncStateFeature } from './sync-state.feature';
import { SyncStateFeatureModule } from './sync-state.feature.module';
import { syncStateReducer } from './sync-state.meta-reducer';
import { SyncStateModule } from './sync-state.module';
import { SyncStateRootModule } from './sync-state.root.module';

describe('SyncStateModule', () => {
  it('forRoot should return SyncStateRootModule, state and meta reducer', () => {
    const config = {
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
