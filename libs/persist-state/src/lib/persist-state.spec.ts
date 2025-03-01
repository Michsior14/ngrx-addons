import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BeforeAppInit } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { debounceTime, map, of } from 'rxjs';
import { PersistState } from './persist-state';
import { rehydrate } from './persist-state.actions';
import {
  PersistStateRootConfig,
  PersistStateStrategy,
} from './persist-state.config';
import type { Async, StateStorage } from './storage';

describe('PersistState', () => {
  const key = 'test';
  const initialState = {
    [key]: {
      valueA: 1,
      valueB: {
        a: 1,
      },
      valueC: 'c',
      version: 0,
    },
  };

  const testStorage = {
    getItem: <T>(_key: string): Async<T | null | undefined> => of(null),
    setItem: (_key: string, _value: Record<string, unknown>): Async<unknown> =>
      of(true),
    removeItem: (_key: string): Async<boolean> => of(true),
  };

  const rootConfig: PersistStateRootConfig<
    ActionReducerMap<typeof initialState>
  > = {
    states: [
      {
        key,
        storage: testStorage as StateStorage,
        storageKey: 'test-guarded',
        runGuard: () => false,
      },
      {
        key,
        storage: () => testStorage as StateStorage,
        storageKey: 'test-b',
        source: (state) => state.pipe(map(({ valueB }) => ({ valueB }))),
      },
      {
        key,
        storage: testStorage as StateStorage,
        storageKey: 'test-a-c',
        migrations: [
          {
            version: 1,
            migrate: (state) =>
              ({ ...state, valueD: 2, version: 2 }) as unknown,
          },
          {
            version: 2,
            versionKey: 'version',
            migrate: (state) =>
              ({ ...state, valueE: 3, version: 3 }) as unknown,
          },
        ],
        source: (state) =>
          state.pipe(
            debounceTime(10),
            map(({ valueA, valueC }) => ({ valueA, valueC })),
          ),
      },
    ],
  };

  let store: MockStore<typeof initialState>;
  let service: PersistState;
  let dispatch: jest.SpyInstance;
  let getItem: jest.SpyInstance;
  let setItem: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PersistState,
        { provide: PersistStateRootConfig, useValue: rootConfig },
        { provide: PersistStateStrategy, useClass: BeforeAppInit },
        provideMockStore({ initialState }),
      ],
    });

    service = TestBed.inject(PersistState);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    store = TestBed.inject(MockStore);
    dispatch = jest.spyOn(store, 'dispatch');
    getItem = jest.spyOn(testStorage, 'getItem');
    setItem = jest.spyOn(testStorage, 'setItem');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addRoot', () => {
    it('should guard listening on changes', fakeAsync(() => {
      service.addRoot();
      tick();
      expect(getItem).not.toHaveBeenCalledWith('test-guarded');
      expect(getItem).toHaveBeenCalledWith('test-b');
      expect(getItem).toHaveBeenCalledWith('test-a-c');
      service.ngOnDestroy();
    }));

    it('should not rehydrate if get item return empty value', fakeAsync(() => {
      service.addRoot();
      tick();
      expect(dispatch).not.toHaveBeenCalled();
      service.ngOnDestroy();
    }));

    it('should rehydrate', fakeAsync(() => {
      const ac = { valueA: 2, valueC: 'd' };
      const b = { valueB: { a: 2 } };
      getItem.mockImplementation((key) => {
        if (key === 'test-b') {
          return of(b);
        }
        if (key === 'test-a-c') {
          return of(ac);
        }
        return of(null);
      });

      service.addRoot();
      tick();
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({ features: { [key]: b } }),
      );
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({
          features: { [key]: ac },
        }),
      );
      service.ngOnDestroy();
    }));

    it('should run migrations', fakeAsync(() => {
      const ac = { valueA: 2, valueC: 'd', version: 1 };
      const b = { valueB: { a: 2 } };
      getItem.mockImplementation((key) => {
        if (key === 'test-b') {
          return of(b);
        }
        if (key === 'test-a-c') {
          return of(ac);
        }
        return of(null);
      });

      service.addRoot();
      tick();
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({ features: { [key]: b } }),
      );
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({
          features: { [key]: { ...ac, version: 3, valueD: 2, valueE: 3 } },
        }),
      );
      service.ngOnDestroy();
    }));

    it('should save on change', fakeAsync(() => {
      service.addRoot();
      tick(15);

      store.setState({
        test: {
          valueA: 2,
          valueB: {
            a: 2,
          },
          valueC: 'd',
          version: 0,
        },
      });
      tick();

      expect(setItem).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith('test-b', {
        valueB: {
          a: 2,
        },
      });

      tick(15);
      expect(setItem).toHaveBeenCalledTimes(2);
      expect(setItem).toHaveBeenCalledWith('test-a-c', {
        valueA: 2,
        valueC: 'd',
      });

      service.ngOnDestroy();
    }));
  });

  describe('addFeature', () => {
    it('should not listen if states are empty', fakeAsync(() => {
      service.addFeature({ key, states: [] });
      tick();
      expect(getItem).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      service.ngOnDestroy();
    }));

    it('should protect from re-adding the feature', fakeAsync(() => {
      const listen = jest.spyOn(
        service as typeof service & {
          listenOnStates: (typeof service)['listenOnStates'];
        },
        'listenOnStates',
      );
      service.addFeature({ key, states: [] });
      service.addFeature({ key, states: [] });
      tick();
      expect(listen).toHaveBeenCalledTimes(1);
      service.ngOnDestroy();
    }));

    it('should rehydrate', fakeAsync(() => {
      const state = { valueB: { a: 2, valueA: 2, valueC: 'd' } };
      getItem.mockReturnValue(of(state));

      service.addFeature({
        key,
        states: [
          {
            storage: testStorage as StateStorage,
          },
        ],
      });
      tick();
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({ features: { [key]: state } }),
      );
      service.ngOnDestroy();
    }));

    it('should run migrations', fakeAsync(() => {
      const state = { valueB: { a: 2, valueA: 2, valueC: 'd' } };
      getItem.mockReturnValue(of(state));

      service.addFeature({
        key,
        states: [
          {
            storage: testStorage as StateStorage,
            migrations: [
              {
                version: undefined,
                migrate: (state): unknown => ({ ...state, version: 1 }),
              },
            ],
          },
        ],
      });
      tick();
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({ features: { [key]: { ...state, version: 1 } } }),
      );
      service.ngOnDestroy();
    }));
  });
});
