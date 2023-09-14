import type { OnDestroy } from '@angular/core';
import { Inject, Injectable } from '@angular/core';
import { SyncState } from './sync-state';
import type { SyncStateFeatureConfig } from './sync-state.config';
import { SYNC_STATE_FEATURE_CONFIGS } from './sync-state.config';

@Injectable()
export class SyncStateFeature implements OnDestroy {
  constructor(
    private readonly syncState: SyncState,
    @Inject(SYNC_STATE_FEATURE_CONFIGS)
    private readonly configs: SyncStateFeatureConfig<unknown>[],
  ) {}

  public addFeatures(): void {
    this.configs.forEach((config) => {
      this.syncState.addFeature(config);
    });
  }

  public ngOnDestroy(): void {
    this.configs.forEach((config) => {
      this.syncState.removeFeature(config.key);
    });
  }
}
