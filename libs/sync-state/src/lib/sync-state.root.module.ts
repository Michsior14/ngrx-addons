import { NgModule, Optional, SkipSelf } from '@angular/core';
import { SyncState } from './sync-state';

@NgModule()
export class SyncStateRootModule {
  constructor(
    state: SyncState,
    @Optional()
    @SkipSelf()
    parentModule?: SyncStateRootModule,
  ) {
    if (parentModule) {
      throw new Error(
        'SyncStateRootModule is already loaded. Import it only once at AppModule!',
      );
    }

    state.addRoot();
  }
}
