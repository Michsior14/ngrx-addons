import { TestBed } from '@angular/core/testing';
import { SyncState } from './sync-state';
import { SyncStateFeature } from './sync-state.feature';
import { provideSyncState, provideSyncStore } from './sync-state.provider';

describe('SyncState providers', () => {
  describe('provideSyncStore', () => {
    it('should provide SyncState and initialize root', () => {
      const syncStateMock = {
        addRoot: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          provideSyncStore(),
          { provide: SyncState, useValue: syncStateMock },
        ],
      });

      const service = TestBed.inject(SyncState);
      expect(service).toBeDefined();

      expect(syncStateMock.addRoot).toHaveBeenCalled();
    });
  });

  describe('provideSyncState', () => {
    it('should provide SyncStateFeature and initialize features', () => {
      const syncStateFeatureMock = {
        addFeatures: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          provideSyncState({ key: 'test', states: [] }),
          { provide: SyncStateFeature, useValue: syncStateFeatureMock },
        ],
      });

      const service = TestBed.inject(SyncStateFeature);
      expect(service).toBeDefined();

      expect(syncStateFeatureMock.addFeatures).toHaveBeenCalled();
    });
  });
});
