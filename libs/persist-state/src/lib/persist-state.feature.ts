import { Injectable, OnDestroy } from '@angular/core';
import { PersistState } from './persist-state';
import { PersistStateFeatureConfig } from './persist-state.config';

@Injectable()
export class PersistStateFeature<T> implements OnDestroy {
  constructor(private readonly persistState: PersistState, private readonly config: PersistStateFeatureConfig<T>) {
    this.persistState.addFeature(this.config);
  }

  public ngOnDestroy(): void {
    this.persistState.removeFeature(this.config.key);
  }
}
