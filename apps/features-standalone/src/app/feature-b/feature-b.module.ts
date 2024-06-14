import { NgModule } from '@angular/core';
import {
  providePersistState,
  sessionStorageStrategy,
} from '@ngrx-addons/persist-state';
import { provideSyncState } from '@ngrx-addons/sync-state';
import { createFeature, createReducer, on, provideState } from '@ngrx/store';
import { globalAction } from '../shared';

const stateB = {
  b: 0,
};

export const featureB = createFeature({
  name: 'b',
  reducer: createReducer(
    stateB,
    on(globalAction, (state) => {
      console.log('Reducer B');
      return {
        ...state,
        b: state.b + 1,
      };
    }),
  ),
});

@NgModule({
  providers: [
    provideState(featureB),
    providePersistState({
      key: featureB.name,
      states: [
        {
          storage: sessionStorageStrategy,
        },
      ],
    }),
    provideSyncState({
      key: featureB.name,
      states: [
        {
          channel: 'channelB',
        },
      ],
    }),
  ],
})
export class FeatureBModule {}
