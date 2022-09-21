import type { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import { SyncState } from './sync-state';
import { SyncStateFeatureConfig } from './sync-state.config';

@Injectable()
export class SyncStateFeature<T> implements OnDestroy {
  constructor(
    private readonly syncState: SyncState,
    private readonly config: SyncStateFeatureConfig<T>
  ) {}

  public addFeature(): void {
    this.syncState.addFeature(this.config);
  }

  public ngOnDestroy(): void {
    this.syncState.removeFeature(this.config.key);
  }
}
