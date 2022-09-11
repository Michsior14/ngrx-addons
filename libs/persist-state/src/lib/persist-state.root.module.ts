import { NgModule } from '@angular/core';
import { PersistState } from './persist-state';

@NgModule()
export class PersistStateRootModule {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_state: PersistState) {
    // Mak sure the state is instantiated
  }
}
