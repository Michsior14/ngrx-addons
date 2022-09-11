import { NgModule } from '@angular/core';
import { PersistStateFeature } from './persist-state.feature';

@NgModule()
export class PersistStateFeatureModule<T> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_state: PersistStateFeature<T>) {
    // Mak sure the state is instantiated
  }
}
