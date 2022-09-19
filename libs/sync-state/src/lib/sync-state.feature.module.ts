import { NgModule } from '@angular/core';
import { SyncStateFeature } from './sync-state.feature';

@NgModule()
export class SyncStateFeatureModule<T> {
  constructor(state: SyncStateFeature<T>) {
    state.addFeature();
  }
}
