import { NgModule, Optional, SkipSelf } from '@angular/core';
import { PersistState } from './persist-state';

@NgModule()
export class PersistStateRootModule {
  constructor(
    state: PersistState,
    @Optional()
    @SkipSelf()
    parentModule?: PersistStateRootModule
  ) {
    if (parentModule) {
      throw new Error(
        'PersistStateRootModule is already loaded. Import it only once at AppModule!'
      );
    }

    state.addRoot();
  }
}
