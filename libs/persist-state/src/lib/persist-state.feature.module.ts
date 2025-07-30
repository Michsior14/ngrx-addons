import { NgModule, inject } from '@angular/core';
import { PersistStateFeature } from './persist-state.feature';

@NgModule()
export class PersistStateFeatureModule {
  constructor() {
    const state = inject(PersistStateFeature);
    state.addFeatures();
  }
}
