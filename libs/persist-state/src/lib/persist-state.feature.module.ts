import { NgModule } from '@angular/core';
import { PersistStateFeature } from './persist-state.feature';

@NgModule()
export class PersistStateFeatureModule<T = object> {
  constructor(state: PersistStateFeature<T>) {
    state.addFeature();
  }
}
