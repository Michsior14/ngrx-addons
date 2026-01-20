import { TestBed } from '@angular/core/testing';
import { PersistState } from './persist-state';
import { PersistStateRootModule } from './persist-state.root.module';

describe('PersistStateRootModule', () => {
  it('should add root state on initialization', () => {
    const persistState = { addRoot: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        PersistStateRootModule,
        { provide: PersistState, useValue: persistState },
      ],
    });

    TestBed.inject(PersistStateRootModule);

    expect(persistState.addRoot).toHaveBeenCalled();
  });
});
