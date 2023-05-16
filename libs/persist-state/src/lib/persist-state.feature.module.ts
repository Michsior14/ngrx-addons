import { NgModule } from '@angular/core';
import { PersistStateFeature } from './persist-state.feature';

@NgModule()
export class PersistStateFeatureModule {
  constructor(state: PersistStateFeature) {
    state.addFeatures();
  }
}
