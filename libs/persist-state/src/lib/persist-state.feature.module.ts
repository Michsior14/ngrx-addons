import { NgModule } from '@angular/core';
import { PersistStateFeature } from './persist-state.feature';

@NgModule()
export class PersistStateFeatureModule<T> {
  constructor(state: PersistStateFeature<T>) {
    state.addFeature();
  }
}
