import { TestBed } from '@angular/core/testing';
import { SyncState } from './sync-state';
import { SyncStateRootModule } from './sync-state.root.module';

describe('SyncStateRootModule', () => {
  it('should add root state on initialization', () => {
    const syncState = { addRoot: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        SyncStateRootModule,
        { provide: SyncState, useValue: syncState },
      ],
    });

    TestBed.inject(SyncStateRootModule);

    expect(syncState.addRoot).toHaveBeenCalled();
  });
});
