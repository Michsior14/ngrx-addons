import { TestBed } from '@angular/core/testing';
import { PersistState } from './persist-state';
import { PersistStateFeatureConfig } from './persist-state.config';
import { PersistStateFeature } from './persist-state.feature';

describe('PersistStateFeature', () => {
  const key = 'test' as const;

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

  let service: PersistStateFeature<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PersistStateFeature,
        { provide: PersistState, useValue: persistState },
        { provide: PersistStateFeatureConfig, useValue: featureConfig },
      ],
    });

    service = TestBed.inject(PersistStateFeature<State>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addFeature', () => {
    it('should call addFeature', () => {
      service.addFeature();
      expect(persistState.addFeature).toBeCalledWith(featureConfig);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call removeFeature', () => {
      service.ngOnDestroy();
      expect(persistState.removeFeature).toBeCalledWith(featureConfig.key);
    });
  });
});
