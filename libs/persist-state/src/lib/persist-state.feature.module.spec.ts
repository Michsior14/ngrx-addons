import { TestBed } from '@angular/core/testing';
import { PersistStateFeature } from './persist-state.feature';
import { PersistStateFeatureModule } from './persist-state.feature.module';

describe('PersistStateFeatureModule', () => {
  it('should add feature states on initialization', () => {
    const persistStateFeature = { addFeatures: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        PersistStateFeatureModule,
        { provide: PersistStateFeature, useValue: persistStateFeature },
      ],
    });

    TestBed.inject(PersistStateFeatureModule);

    expect(persistStateFeature.addFeatures).toHaveBeenCalled();
  });
});
