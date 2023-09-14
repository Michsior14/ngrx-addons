import { NgModule } from '@angular/core';
import {
  PersistStateModule,
  sessionStorageStrategy,
} from '@ngrx-addons/persist-state';
import { SyncStateModule } from '@ngrx-addons/sync-state';
import { StoreModule, createFeature, createReducer, on } from '@ngrx/store';
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
  imports: [
    StoreModule.forFeature(featureB),
    PersistStateModule.forFeature({
      key: featureB.name,
      states: [
        {
          storage: sessionStorageStrategy,
        },
      ],
    }),
    SyncStateModule.forFeature({
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
