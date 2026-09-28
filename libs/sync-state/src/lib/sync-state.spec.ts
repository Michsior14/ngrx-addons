import { ErrorHandler } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import type { InitializationStrategy } from '@ngrx-addons/common';
import { BeforeAppInit } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import {
  createAction,
  createReducer,
  on,
  props,
  provideStore,
  Store,
} from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { Observable } from 'rxjs';
import { debounceTime, map, Subject, takeUntil, throwError } from 'rxjs';
import { SyncState } from './sync-state';
import { storeSyncAction } from './sync-state.actions';
import { SyncStateRootConfig, SyncStateStrategy } from './sync-state.config';
import { syncStateReducer } from './sync-state.meta-reducer';

const channels = new Map<
  string,
  { instance: MockBroadcastChannel; subject: Subject<unknown> }
>();

class MockBroadcastChannel implements BroadcastChannel {
  readonly #destroy = new Subject<void>();
  constructor(public name: string) {
    channels.set(name, { instance: this, subject: new Subject() });
  }
  public onmessage = jest.fn();
  public onmessageerror = jest.fn();
  public close = jest.fn().mockImplementation(() => {
    this.#destroy.next();
    this.#destroy.complete();
  });
  public postMessage = jest.fn().mockImplementation((message) => {
    // Fail fast instead of hanging if messages are sent back and forth
    if (this.postMessage.mock.calls.length > 50) {
      throw new Error(`Too many messages on ${this.name}`);
    }
    channels.get(this.name)?.subject.next(message);
  });
  public addEventListener = jest
    .fn()
    .mockImplementation((_type, listener: (message: MessageEvent) => void) => {
      channels
        .get(this.name)
        ?.subject.pipe(takeUntil(this.#destroy))

        .subscribe((data) => {
          listener(new MessageEvent('message', { data }));
        });
    });
  public removeEventListener = jest.fn();
  public dispatchEvent = jest.fn();
}

describe('SyncState', () => {
  const key = 'test';
  const initialState = {
    [key]: {
      valueA: 1,
      valueB: {
        a: 1,
      },
      valueC: 'c',
    },
  };

  type TestState = (typeof initialState)[typeof key];

  const rootConfig: SyncStateRootConfig<ActionReducerMap<typeof initialState>> =
    {
      states: [
        {
          key,
          channel: 'test-guarded',
          runGuard: () => false,
        },
        {
          key,
          channel: 'test-b',
          source: (state) => state.pipe(map(({ valueB }) => ({ valueB }))),
        },
        {
          key,
          channel: 'test-a-c',
          source: (state) =>
            state.pipe(
              debounceTime(10),
              map(({ valueA, valueC }) => ({ valueA, valueC })),
            ),
        },
      ],
    };

  let store: MockStore<typeof initialState>;
  let service: SyncState;
  let dispatch: jest.SpyInstance;
  let broadcastChannel: jest.SpyInstance;
  let errorHandler: { handleError: jest.Mock };

  const configure = (
    config: SyncStateRootConfig<ActionReducerMap<typeof initialState>>,
    providers: unknown[],
  ): SyncState => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SyncState,
        { provide: SyncStateRootConfig, useValue: config },
        { provide: ErrorHandler, useValue: errorHandler },
        ...(providers as never[]),
      ],
    });
    return TestBed.inject<SyncState>(SyncState);
  };

  beforeEach(() => {
    errorHandler = { handleError: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        SyncState,
        { provide: SyncStateRootConfig, useValue: rootConfig },
        { provide: SyncStateStrategy, useClass: BeforeAppInit },
        { provide: ErrorHandler, useValue: errorHandler },
        provideMockStore({ initialState }),
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    service = TestBed.inject(SyncState);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    store = TestBed.inject(MockStore);
    dispatch = jest.spyOn(store, 'dispatch');

    window.BroadcastChannel = MockBroadcastChannel;
    broadcastChannel = jest
      .spyOn(window, 'BroadcastChannel')
      .mockImplementation((name) => new MockBroadcastChannel(name));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addRoot', () => {
    it('should guard listening on changes', fakeAsync(() => {
      service.addRoot();
      tick();
      expect(broadcastChannel).not.toHaveBeenCalledWith('test-guarded');
      expect(broadcastChannel).toHaveBeenCalledWith('test-b');
      expect(broadcastChannel).toHaveBeenCalledWith('test-a-c');
      service.ngOnDestroy();
    }));

    it('should not dispatch if no message', fakeAsync(() => {
      service.addRoot();
      tick();
      expect(dispatch).not.toHaveBeenCalled();
      service.ngOnDestroy();
    }));

    it('should dispatch on received message', fakeAsync(() => {
      const ac = { valueA: 2, valueC: 'd' };
      const b = { valueB: { a: 2 } };
      service.addRoot();
      tick();
      channels.get('test-b')?.instance.postMessage(b);
      expect(dispatch).toHaveBeenCalledWith(
        storeSyncAction({ features: { [key]: b } }),
      );
      channels.get('test-a-c')?.instance.postMessage(ac);
      expect(dispatch).toHaveBeenCalledWith(
        storeSyncAction({ features: { [key]: ac } }),
      );
      service.ngOnDestroy();
    }));

    it('should post message on change', fakeAsync(() => {
      service.addRoot();
      tick(15);

      store.setState({
        test: {
          valueA: 2,
          valueB: {
            a: 2,
          },
          valueC: 'd',
        },
      });

      tick();
      expect(
        channels.get('test-b')?.instance.postMessage,
      ).toHaveBeenCalledTimes(1);
      expect(channels.get('test-b')?.instance.postMessage).toHaveBeenCalledWith(
        {
          valueB: {
            a: 2,
          },
        },
      );

      tick(15);
      expect(
        channels.get('test-a-c')?.instance.postMessage,
      ).toHaveBeenCalledTimes(1);
      expect(
        channels.get('test-a-c')?.instance.postMessage,
      ).toHaveBeenCalledWith({
        valueA: 2,
        valueC: 'd',
      });

      service.ngOnDestroy();
    }));

    it('should post the next local change if a received value causes no state emission', fakeAsync(() => {
      service.addRoot();
      tick();

      channels.get('test-b')?.instance.postMessage({ valueB: { a: 1 } });
      tick();

      // This emits a state equal to the current state, so distinctUntilChanged
      // prevents the received value from reaching the source tap.
      store.setState(initialState);
      tick();
      const channel = channels.get('test-b')?.instance;
      channel?.postMessage.mockClear();

      store.setState({
        test: {
          ...initialState.test,
          valueB: { a: 2 },
        },
      });
      tick();

      expect(channel?.postMessage).toHaveBeenCalledWith({ valueB: { a: 2 } });
      service.ngOnDestroy();
    }));

    it('should not post until the state is defined', fakeAsync(() => {
      service.addFeature({ key: 'lazy', states: [{}] });
      tick();

      // The first defined state is the initial one, so it is skipped
      store.setState({ ...initialState, lazy: { a: 1 } } as never);
      tick();
      const channel = channels.get('lazy@store')?.instance;
      expect(channel?.postMessage).not.toHaveBeenCalled();

      store.setState({ ...initialState, lazy: { a: 2 } } as never);
      tick();
      expect(channel?.postMessage).toHaveBeenCalledWith({ a: 2 });
      service.ngOnDestroy();
    }));

    it('should report failed posts and keep syncing', fakeAsync(() => {
      service.addRoot();
      tick();
      const channel = channels.get('test-b')?.instance;
      const error = new Error('DataCloneError');
      channel?.postMessage.mockImplementationOnce(() => {
        throw error;
      });

      store.setState({ test: { ...initialState.test, valueB: { a: 2 } } });
      tick();
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);

      store.setState({ test: { ...initialState.test, valueB: { a: 3 } } });
      tick();
      expect(channel?.postMessage).toHaveBeenLastCalledWith({
        valueB: { a: 3 },
      });
      service.ngOnDestroy();
    }));

    it('should report a failing channel without stopping other states', fakeAsync(() => {
      const error = new Error('SecurityError');
      broadcastChannel.mockImplementation((name: string) => {
        if (name === 'test-b') {
          throw error;
        }
        return new MockBroadcastChannel(name);
      });

      service.addRoot();
      tick(15);
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);

      store.setState({ test: { ...initialState.test, valueA: 2 } });
      tick(15);
      expect(
        channels.get('test-a-c')?.instance.postMessage,
      ).toHaveBeenCalledWith({ valueA: 2, valueC: 'c' });
      service.ngOnDestroy();
    }));

    it('should report a failing source without stopping other states', fakeAsync(() => {
      const error = new Error('source');
      const failingService = configure(
        {
          states: [
            {
              key,
              channel: 'test-failing',
              source: (): Observable<never> => throwError(() => error),
            },
            { key, channel: 'test-working' },
          ],
        },
        [
          { provide: SyncStateStrategy, useClass: BeforeAppInit },
          provideMockStore({ initialState }),
        ],
      );
      const mockStore = TestBed.inject(MockStore);

      failingService.addRoot();
      tick();
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
      expect(channels.get('test-failing')?.instance.close).toHaveBeenCalled();

      const changed = { ...initialState.test, valueA: 2 };
      mockStore.setState({ test: changed });
      tick();
      expect(
        channels.get('test-working')?.instance.postMessage,
      ).toHaveBeenCalledWith(changed);
      failingService.ngOnDestroy();
    }));
  });

  describe('with a real store', () => {
    const setValueA = createAction(
      '[Test] Set Value A',
      props<{ valueA: number }>(),
    );

    const setup = (
      states: NonNullable<
        SyncStateRootConfig<ActionReducerMap<typeof initialState>>['states']
      >,
      onSync = (state: TestState): TestState => state,
    ): { realService: SyncState; realStore: Store<typeof initialState> } => {
      const reducer = createReducer(
        initialState[key],
        on(setValueA, (state, { valueA }): TestState => ({ ...state, valueA })),
        on(storeSyncAction, (state): TestState => onSync(state)),
      );
      const realService = configure({ states }, [
        { provide: SyncStateStrategy, useClass: BeforeAppInit },
        provideStore({ [key]: reducer }, { metaReducers: [syncStateReducer] }),
      ]);
      return {
        realService,
        realStore: TestBed.inject<Store<typeof initialState>>(Store),
      };
    };

    const received = { ...initialState[key], valueA: 2 };

    it('should not post a received state back', fakeAsync(() => {
      const { realService, realStore } = setup([{ key, channel: 'real' }]);
      realService.addRoot();
      tick();

      const channel = channels.get('real')?.instance;
      channel?.postMessage(received);
      tick();

      expect(realStore.selectSignal((state) => state[key])()).toEqual(received);
      // Only the simulated message from another tab
      expect(channel?.postMessage).toHaveBeenCalledTimes(1);
      realService.ngOnDestroy();
    }));

    it('should not post a state changed by a reducer while applying a received state', fakeAsync(() => {
      const { realService } = setup(
        [{ key, channel: 'real-transformed' }],
        (state) => ({ ...state, valueC: `${state.valueC}!` }),
      );
      realService.addRoot();
      tick();

      const channel = channels.get('real-transformed')?.instance;
      channel?.postMessage(received);
      tick();

      expect(channel?.postMessage).toHaveBeenCalledTimes(1);
      realService.ngOnDestroy();
    }));

    it('should not post a delayed echo of a received state', fakeAsync(() => {
      const { realService, realStore } = setup([
        {
          key,
          channel: 'real-debounced',
          source: (state): Observable<TestState> =>
            state.pipe(debounceTime(10)),
        },
      ]);
      realService.addRoot();
      tick(15);

      const channel = channels.get('real-debounced')?.instance;
      channel?.postMessage(received);
      tick(15);
      expect(channel?.postMessage).toHaveBeenCalledTimes(1);

      realStore.dispatch(setValueA({ valueA: 3 }));
      tick(15);
      expect(channel?.postMessage).toHaveBeenCalledTimes(2);
      expect(channel?.postMessage).toHaveBeenLastCalledWith({
        ...received,
        valueA: 3,
      });
      realService.ngOnDestroy();
    }));

    it('should post a local change made after a received state', fakeAsync(() => {
      const { realService, realStore } = setup([
        { key, channel: 'real-local' },
      ]);
      realService.addRoot();
      tick();

      const channel = channels.get('real-local')?.instance;
      channel?.postMessage(received);
      tick();

      realStore.dispatch(setValueA({ valueA: 3 }));
      tick();
      expect(channel?.postMessage).toHaveBeenCalledTimes(2);
      expect(channel?.postMessage).toHaveBeenLastCalledWith({
        ...received,
        valueA: 3,
      });
      realService.ngOnDestroy();
    }));
  });

  describe('addFeature', () => {
    it('should not listen if states are empty', fakeAsync(() => {
      service.addFeature({ key, states: [] });
      tick();
      expect(broadcastChannel).not.toHaveBeenCalled();
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

    it('should keep a feature subscription until all registrations are removed', fakeAsync(() => {
      const feature = { key, states: [{ channel: 'shared-feature' }] };
      service.addFeature(feature);
      service.addFeature(feature);
      tick();

      const channel = channels.get('shared-feature')?.instance;
      service.removeFeature(key);
      expect(channel?.close).not.toHaveBeenCalled();

      service.removeFeature(key);
      expect(channel?.close).toHaveBeenCalledTimes(1);
      service.ngOnDestroy();
    }));

    it('should not tear down the root subscription when a feature is named root', fakeAsync(() => {
      service.addRoot();
      service.addFeature({
        key: 'root',
        states: [{ channel: 'feature-root' }],
      });
      tick();

      const rootChannel = channels.get('test-b')?.instance;
      const featureChannel = channels.get('feature-root')?.instance;
      service.removeFeature('root');

      expect(featureChannel?.close).toHaveBeenCalledTimes(1);
      expect(rootChannel?.close).not.toHaveBeenCalled();
      service.ngOnDestroy();
    }));

    it('should open the channel only after initialization', fakeAsync(() => {
      const initialized = new Subject<void>();
      const strategy: InitializationStrategy = {
        when: () => initialized,
      };
      const lazyService = configure({}, [
        { provide: SyncStateStrategy, useValue: strategy },
        provideMockStore({ initialState }),
      ]);

      lazyService.addFeature({ key, states: [{ channel: 'lazy-channel' }] });
      tick();
      expect(broadcastChannel).not.toHaveBeenCalled();

      initialized.next();
      expect(broadcastChannel).toHaveBeenCalledWith('lazy-channel');

      lazyService.removeFeature(key);
      expect(channels.get('lazy-channel')?.instance.close).toHaveBeenCalled();
      lazyService.ngOnDestroy();
    }));

    it('should sync state', fakeAsync(() => {
      service.addFeature({
        key,
        states: [{}],
      });

      const state = { valueB: { a: 2, valueA: 2, valueC: 'd' } };
      channels.get(`${key}@store`)?.instance.postMessage(state);
      tick();

      expect(dispatch).toHaveBeenCalledWith(
        storeSyncAction({ features: { [key]: state } }),
      );
      service.ngOnDestroy();
    }));
  });

  describe('SSR (runGuard returns false)', () => {
    it('should skip syncing when runGuard returns false for root states', fakeAsync(() => {
      const ssrConfig: SyncStateRootConfig<
        ActionReducerMap<typeof initialState>
      > = {
        states: [{ key, runGuard: (): boolean => false }],
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SyncState,
          { provide: SyncStateRootConfig, useValue: ssrConfig },
          { provide: SyncStateStrategy, useClass: BeforeAppInit },
          provideMockStore({ initialState }),
        ],
      });

      const ssrService = TestBed.inject(SyncState);
      const ssrStore = TestBed.inject(MockStore);
      const ssrDispatch = jest.spyOn(ssrStore, 'dispatch');

      ssrService.addRoot();
      tick();

      expect(ssrDispatch).not.toHaveBeenCalled();

      ssrService.ngOnDestroy();
    }));

    it('should skip feature syncing when runGuard returns false', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SyncState,
          { provide: SyncStateRootConfig, useValue: {} },
          { provide: SyncStateStrategy, useClass: BeforeAppInit },
          provideMockStore({ initialState }),
        ],
      });

      const ssrService = TestBed.inject(SyncState);
      const ssrStore = TestBed.inject(MockStore);
      const ssrDispatch = jest.spyOn(ssrStore, 'dispatch');

      ssrService.addFeature({
        key,
        states: [{ runGuard: (): boolean => false }],
      });
      tick();

      expect(ssrDispatch).not.toHaveBeenCalled();

      ssrService.ngOnDestroy();
    }));
  });
});
