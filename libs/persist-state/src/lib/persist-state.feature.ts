import type { OnDestroy } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { PersistState } from './persist-state';
import type { PersistStateFeatureConfig } from './persist-state.config';
import { PERSIST_STATE_FEATURE_CONFIGS } from './persist-state.config';

@Injectable()
export class PersistStateFeature implements OnDestroy {
  private readonly persistState = inject(PersistState);
  private readonly configs = inject<PersistStateFeatureConfig<unknown>[]>(
    PERSIST_STATE_FEATURE_CONFIGS,
  );

  public addFeatures(): void {
    this.configs.forEach((config) => {
      this.persistState.addFeature(config);
    });
  }

  public ngOnDestroy(): void {
    this.configs.forEach((config) => {
      this.persistState.removeFeature(config.key);
    });
  }
}
