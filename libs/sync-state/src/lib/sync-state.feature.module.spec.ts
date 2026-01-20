import { TestBed } from '@angular/core/testing';
import { SyncStateFeature } from './sync-state.feature';
import { SyncStateFeatureModule } from './sync-state.feature.module';

describe('SyncStateFeatureModule', () => {
  it('should add feature states on initialization', () => {
    const syncStateFeature = { addFeatures: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        SyncStateFeatureModule,
        { provide: SyncStateFeature, useValue: syncStateFeature },
      ],
    });

    TestBed.inject(SyncStateFeatureModule);

    expect(syncStateFeature.addFeatures).toHaveBeenCalled();
  });
});
