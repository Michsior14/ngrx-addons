import { NgModule } from '@angular/core';
import { SyncStateFeature } from './sync-state.feature';

@NgModule()
export class SyncStateFeatureModule {
  constructor(state: SyncStateFeature) {
    state.addFeatures();
  }
}
