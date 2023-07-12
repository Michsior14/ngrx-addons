import type { OnDestroy } from '@angular/core';
import { Inject, Injectable } from '@angular/core';
import { PersistState } from './persist-state';
import type { PersistStateFeatureConfig } from './persist-state.config';
import { PERSIST_STATE_FEATURE_CONFIGS } from './persist-state.config';

@Injectable()
export class PersistStateFeature implements OnDestroy {
  constructor(
    private readonly persistState: PersistState,
    @Inject(PERSIST_STATE_FEATURE_CONFIGS)
    private readonly configs: PersistStateFeatureConfig<unknown>[]
  ) {}

  public addFeatures(): void {
    this.configs.forEach((config) => { this.persistState.addFeature(config); });
  }

  public ngOnDestroy(): void {
    this.configs.forEach((config) =>
      { this.persistState.removeFeature(config.key); }
    );
  }
}
