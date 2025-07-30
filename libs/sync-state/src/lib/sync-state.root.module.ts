import { NgModule, inject } from '@angular/core';
import { SyncState } from './sync-state';

@NgModule()
export class SyncStateRootModule {
  constructor() {
    const state = inject(SyncState);
    const parentModule = inject(SyncStateRootModule, {
      optional: true,
      skipSelf: true,
    });

    if (parentModule) {
      throw new Error(
        'SyncStateRootModule is already loaded. Import it only once at AppModule!',
      );
    }

    state.addRoot();
  }
}
