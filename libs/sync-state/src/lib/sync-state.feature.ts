import type { OnDestroy } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { SyncState } from './sync-state';
import type { SyncStateFeatureConfig } from './sync-state.config';
import { SYNC_STATE_FEATURE_CONFIGS } from './sync-state.config';

@Injectable()
export class SyncStateFeature implements OnDestroy {
  private readonly syncState = inject(SyncState);
  private readonly configs = inject<SyncStateFeatureConfig<unknown>[]>(
    SYNC_STATE_FEATURE_CONFIGS,
  );

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
