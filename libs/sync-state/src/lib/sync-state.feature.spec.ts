import { TestBed } from '@angular/core/testing';
import { SyncState } from './sync-state';
import type { SyncStateFeatureConfig } from './sync-state.config';
import { SYNC_STATE_FEATURE_CONFIGS } from './sync-state.config';
import { SyncStateFeature } from './sync-state.feature';

describe('SyncStateFeature', () => {
  const key = 'test' as const;

  interface State {
    a: number;
  }

  const featureConfig: SyncStateFeatureConfig<State> = {
    key,
    states: [],
  };

  const syncState: jest.Mocked<Partial<SyncState>> = {
    addFeature: jest.fn(),
    removeFeature: jest.fn(),
  };

  let service: SyncStateFeature;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SyncStateFeature,
        { provide: SyncState, useValue: syncState },
        { provide: SYNC_STATE_FEATURE_CONFIGS, useValue: [featureConfig] },
      ],
    });

    service = TestBed.inject(SyncStateFeature);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addFeature', () => {
    it('should call addFeature', () => {
      service.addFeatures();
      expect(syncState.addFeature).toBeCalledWith(featureConfig);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call removeFeature', () => {
      service.ngOnDestroy();
      expect(syncState.removeFeature).toBeCalledWith(featureConfig.key);
    });
  });
});
