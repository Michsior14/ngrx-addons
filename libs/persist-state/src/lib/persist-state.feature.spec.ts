import { TestBed } from '@angular/core/testing';
import { PersistState } from './persist-state';
import type { PersistStateFeatureConfig } from './persist-state.config';
import { PERSIST_STATE_FEATURE_CONFIGS } from './persist-state.config';
import { PersistStateFeature } from './persist-state.feature';

describe('PersistStateFeature', () => {
  const key = 'test';

  interface State {
    a: number;
  }

  const featureConfig: PersistStateFeatureConfig<State> = {
    key,
    states: [],
  };

  const persistState: jest.Mocked<Partial<PersistState>> = {
    addFeature: jest.fn(),
    removeFeature: jest.fn(),
  };

  let service: PersistStateFeature;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PersistStateFeature,
        { provide: PersistState, useValue: persistState },
        { provide: PERSIST_STATE_FEATURE_CONFIGS, useValue: [featureConfig] },
      ],
    });

    service = TestBed.inject(PersistStateFeature);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addFeature', () => {
    it('should call addFeature', () => {
      service.addFeatures();
      expect(persistState.addFeature).toHaveBeenCalledWith(featureConfig);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call removeFeature', () => {
      service.ngOnDestroy();
      expect(persistState.removeFeature).toHaveBeenCalledWith(
        featureConfig.key,
      );
    });
  });
});
