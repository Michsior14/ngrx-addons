import { NgModule, inject } from '@angular/core';
import { PersistState } from './persist-state';

@NgModule()
export class PersistStateRootModule {
  constructor() {
    const state = inject(PersistState);
    const parentModule = inject(PersistStateRootModule, {
      optional: true,
      skipSelf: true,
    });

    if (parentModule) {
      throw new Error(
        'PersistStateRootModule is already loaded. Import it only once at AppModule!',
      );
    }

    state.addRoot();
  }
}
