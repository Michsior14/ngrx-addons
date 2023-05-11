import { NgModule } from '@angular/core';
import { SyncStateFeature } from './sync-state.feature';

@NgModule()
export class SyncStateFeatureModule<T = object> {
  constructor(state: SyncStateFeature<T>) {
    state.addFeature();
  }
}
