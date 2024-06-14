import { NgModule } from '@angular/core';
import {
  providePersistState,
  sessionStorageStrategy,
} from '@ngrx-addons/persist-state';
import { provideSyncState } from '@ngrx-addons/sync-state';
import { createFeature, createReducer, on, provideState } from '@ngrx/store';
import { globalAction } from '../shared';

const stateA = {
  a: 0,
};

export const featureA = createFeature({
  name: 'a',
  reducer: createReducer(
    stateA,
    on(globalAction, (state) => {
      console.log('Reducer A');
      return {
        ...state,
        a: state.a + 1,
      };
    }),
  ),
});

@NgModule({
  providers: [
    provideState(featureA),
    providePersistState({
      key: featureA.name,
      states: [
        {
          storage: sessionStorageStrategy,
        },
      ],
    }),
    provideSyncState({
      key: featureA.name,
      states: [
        {
          channel: 'channelA',
        },
      ],
    }),
  ],
})
export class FeatureAModule {}
