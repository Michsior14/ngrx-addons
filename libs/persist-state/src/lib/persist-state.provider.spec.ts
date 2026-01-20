import { TestBed } from '@angular/core/testing';
import { PersistState } from './persist-state';
import { PersistStateFeature } from './persist-state.feature';
import {
  providePersistState,
  providePersistStore,
} from './persist-state.provider';

describe('PersistState providers', () => {
  describe('providePersistStore', () => {
    it('should provide PersistState and initialize root', () => {
      const persistStateMock = {
        addRoot: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          providePersistStore(),
          { provide: PersistState, useValue: persistStateMock },
        ],
      });

      // We need to inject something to trigger environment initializers in some versions,
      // but usually configureTestingModule + inject is enough.
      // However, environment initializers run on environment initialization.
      // In TestBed, this happens when the test module is instantiated.

      // Let's verify we can inject the service (though we mocked it).
      const service = TestBed.inject(PersistState);
      expect(service).toBeDefined();

      // The key part: verify addRoot was called via the APP_INITIALIZER / ENVIRONMENT_INITIALIZER
      expect(persistStateMock.addRoot).toHaveBeenCalled();
    });
  });

  describe('providePersistState', () => {
    it('should provide PersistStateFeature and initialize features', () => {
      const persistStateFeatureMock = {
        addFeatures: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          providePersistState({ key: 'test', states: [] }),
          { provide: PersistStateFeature, useValue: persistStateFeatureMock },
        ],
      });

      const service = TestBed.inject(PersistStateFeature);
      expect(service).toBeDefined();

      expect(persistStateFeatureMock.addFeatures).toHaveBeenCalled();
    });
  });
});
