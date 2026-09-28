import { ErrorHandler } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { InitializationStrategy } from '@ngrx-addons/common';
import { BeforeAppInit } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { debounceTime, map, of, Subject, throwError } from 'rxjs';
import { PersistState } from './persist-state';
import { rehydrate } from './persist-state.actions';
import {
  PersistStateRootConfig,
  PersistStateStrategy,
} from './persist-state.config';
import type { Async } from './storage';

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
        storage: testStorage,
        storageKey: 'test-guarded',
        runGuard: () => false,
      },
      {
        key,
        storage: () => testStorage,
        storageKey: 'test-b',
        source: (state) => state.pipe(map(({ valueB }) => ({ valueB }))),
      },
      {
        key,
        storage: testStorage,
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
  let errorHandler: { handleError: jest.Mock };

  const configure = (
    config: PersistStateRootConfig<ActionReducerMap<typeof initialState>>,
    strategy: InitializationStrategy = new BeforeAppInit(),
  ): {
    configured: PersistState;
    configuredStore: MockStore<typeof initialState>;
  } => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        PersistState,
        { provide: PersistStateRootConfig, useValue: config },
        { provide: PersistStateStrategy, useValue: strategy },
        { provide: ErrorHandler, useValue: errorHandler },
        provideMockStore({ initialState }),
      ],
    });
    return {
      configured: TestBed.inject<PersistState>(PersistState),
      configuredStore:
        TestBed.inject<MockStore<typeof initialState>>(MockStore),
    };
  };

  beforeEach(() => {
    errorHandler = { handleError: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        PersistState,
        { provide: PersistStateRootConfig, useValue: rootConfig },
        { provide: PersistStateStrategy, useClass: BeforeAppInit },
        { provide: ErrorHandler, useValue: errorHandler },
        provideMockStore({ initialState }),
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
            storage: testStorage,
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
            storage: testStorage,
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

    it('should restore falsy values', fakeAsync(() => {
      getItem.mockReturnValue(of(0));
      service.addFeature({
        key: 'counter',
        states: [{ storage: testStorage }],
      });
      tick();
      expect(dispatch).toHaveBeenCalledWith(
        rehydrate({ features: { counter: 0 } }),
      );
      service.ngOnDestroy();
    }));

    it('should not save until the state is defined', fakeAsync(() => {
      service.addFeature({ key: 'lazy', states: [{ storage: testStorage }] });
      tick();

      // The first defined state is the initial one, so it is skipped
      store.setState({ ...initialState, lazy: { a: 1 } } as never);
      tick();
      expect(setItem).not.toHaveBeenCalled();

      store.setState({ ...initialState, lazy: { a: 2 } } as never);
      tick();
      expect(setItem).toHaveBeenCalledWith('lazy@store', { a: 2 });
      service.ngOnDestroy();
    }));

    it('should keep a feature subscription until all registrations are removed', fakeAsync(() => {
      const feature = { key, states: [{ storage: testStorage }] };
      service.addFeature(feature);
      service.addFeature(feature);
      tick();

      service.removeFeature(key);
      store.setState({ test: { ...initialState[key], valueA: 2 } });
      tick();
      expect(setItem).toHaveBeenCalledTimes(1);

      service.removeFeature(key);
      store.setState({ test: { ...initialState[key], valueA: 3 } });
      tick();
      expect(setItem).toHaveBeenCalledTimes(1);
      service.ngOnDestroy();
    }));

    it('should not tear down the root subscription when a feature is named root', fakeAsync(() => {
      service.addRoot();
      service.addFeature({ key: 'root', states: [{ storage: testStorage }] });
      tick(15);
      service.removeFeature('root');

      store.setState({ test: { ...initialState[key], valueB: { a: 2 } } });
      tick();
      expect(setItem).toHaveBeenCalledWith('test-b', { valueB: { a: 2 } });
      service.ngOnDestroy();
    }));
  });

  describe('startup', () => {
    it('should not save before the stored state is restored', fakeAsync(() => {
      const initialized = new Subject<void>();
      const { configured, configuredStore } = configure(
        { states: [{ key, storage: testStorage, storageKey: 'test-startup' }] },
        { when: () => initialized },
      );
      const configuredDispatch = jest.spyOn(configuredStore, 'dispatch');
      const stored = { ...initialState[key], valueA: 5 };
      getItem.mockReturnValue(of(stored));

      configured.addRoot();
      configuredStore.setState({ test: { ...initialState[key], valueA: 2 } });
      tick();
      expect(getItem).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();

      initialized.next();
      tick();
      expect(configuredDispatch).toHaveBeenCalledWith(
        rehydrate({ features: { [key]: stored } }),
      );
      expect(setItem).not.toHaveBeenCalled();

      const changed = { ...initialState[key], valueA: 3 };
      configuredStore.setState({ test: changed });
      tick();
      expect(setItem).toHaveBeenCalledWith('test-startup', changed);
      configured.ngOnDestroy();
    }));
  });

  describe('errors', () => {
    it('should report failed saves and keep saving', fakeAsync(() => {
      const error = new Error('QuotaExceededError');
      setItem.mockImplementationOnce(() => {
        throw error;
      });
      service.addFeature({ key, states: [{ storage: testStorage }] });
      tick();

      store.setState({ test: { ...initialState[key], valueA: 2 } });
      tick();
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);

      const changed = { ...initialState[key], valueA: 3 };
      store.setState({ test: changed });
      tick();
      expect(setItem).toHaveBeenLastCalledWith(`${key}@store`, changed);
      service.ngOnDestroy();
    }));

    it('should report failed restores without saving that state', fakeAsync(() => {
      const error = new Error('read failed');
      getItem.mockImplementation((storageKey: string) =>
        storageKey === 'test-failing' ? throwError(() => error) : of(null),
      );
      const { configured, configuredStore } = configure({
        states: [
          { key, storage: testStorage, storageKey: 'test-failing' },
          { key, storage: testStorage, storageKey: 'test-working' },
        ],
      });

      configured.addRoot();
      tick();
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);

      const changed = { ...initialState[key], valueA: 2 };
      configuredStore.setState({ test: changed });
      tick();
      expect(setItem).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith('test-working', changed);
      configured.ngOnDestroy();
    }));
  });

  describe('SSR (runGuard returns false)', () => {
    it('should skip persistence when runGuard returns false for root states', fakeAsync(() => {
      const ssrConfig: PersistStateRootConfig<
        ActionReducerMap<typeof initialState>
      > = {
        states: [
          {
            key,
            storage: testStorage,
            runGuard: () => false,
          },
        ],
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          PersistState,
          { provide: PersistStateRootConfig, useValue: ssrConfig },
          { provide: PersistStateStrategy, useClass: BeforeAppInit },
          provideMockStore({ initialState }),
        ],
      });

      const ssrService = TestBed.inject(PersistState);
      const ssrStore = TestBed.inject(MockStore);
      const ssrDispatch = jest.spyOn(ssrStore, 'dispatch');
      const ssrGetItem = jest.spyOn(testStorage, 'getItem').mockClear();

      ssrService.addRoot();
      tick();

      expect(ssrGetItem).not.toHaveBeenCalled();
      expect(ssrDispatch).not.toHaveBeenCalled();

      ssrService.ngOnDestroy();
    }));

    it('should skip feature persistence when runGuard returns false', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          PersistState,
          { provide: PersistStateRootConfig, useValue: {} },
          { provide: PersistStateStrategy, useClass: BeforeAppInit },
          provideMockStore({ initialState }),
        ],
      });

      const ssrService = TestBed.inject(PersistState);
      const ssrStore = TestBed.inject(MockStore);
      const ssrDispatch = jest.spyOn(ssrStore, 'dispatch');
      const ssrGetItem = jest.spyOn(testStorage, 'getItem').mockClear();

      ssrService.addFeature({
        key,
        states: [
          {
            storage: testStorage,
            runGuard: (): boolean => false,
          },
        ],
      });
      tick();

      expect(ssrGetItem).not.toHaveBeenCalled();
      expect(ssrDispatch).not.toHaveBeenCalled();

      ssrService.ngOnDestroy();
    }));
  });
});
