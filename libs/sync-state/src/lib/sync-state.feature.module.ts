import { NgModule, inject } from '@angular/core';
import { SyncStateFeature } from './sync-state.feature';

@NgModule()
export class SyncStateFeatureModule {
  constructor() {
    const state = inject(SyncStateFeature);
    state.addFeatures();
  }
}
