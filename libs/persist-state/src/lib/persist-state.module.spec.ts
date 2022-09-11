import { META_REDUCERS } from '@ngrx/store';
import { PersistState } from './persist-state';
import {
  PersistStateFeatureConfig,
  PersistStateRootConfig,
} from './persist-state.config';
import { PersistStateFeature } from './persist-state.feature';
import { PersistStateFeatureModule } from './persist-state.feature.module';
import { persistStateReducer } from './persist-state.meta-reducer';
import { PersistStateModule } from './persist-state.module';
import { PersistStateRootModule } from './persist-state.root.module';

describe('PersistStateModule', () => {
  it('forRoot should return PersistStateRootModule, state and meta reducer', () => {
    const config = {
      states: [],
    };
    expect(PersistStateModule.forRoot(config)).toEqual({
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
    });
  });
  it('forFeature should return PersistStateFeatureModule and service', () => {
    const config = {
      key: 'key',
      states: [],
    };
    expect(PersistStateModule.forFeature(config)).toEqual({
      ngModule: PersistStateFeatureModule,
      providers: [
        { provide: PersistStateFeatureConfig, useValue: config },
        PersistStateFeature,
      ],
    });
  });
});
