import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BeforeAppInit } from '@ngrx-addons/common';
import type { ActionReducerMap } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { debounceTime, map, Subject, takeUntil } from 'rxjs';
import { SyncState } from './sync-state';
import { storeSyncAction } from './sync-state.actions';
import { SyncStateRootConfig, SyncStateStrategy } from './sync-state.config';

const channels = new Map<
  string,
  { instance: MockBroadcastChannel; subject: Subject<unknown> }
>();

class MockBroadcastChannel implements BroadcastChannel {
  readonly #destroy = new Subject<void>();
  constructor(public name: string) {
    channels.set(name, { instance: this, subject: new Subject() });
  }
  onmessage = jest.fn();
  onmessageerror = jest.fn();
  close = jest.fn().mockImplementation(() => {
    this.#destroy.next();
    this.#destroy.complete();
  });
  postMessage = jest
    .fn()
    .mockImplementation((message) =>
      channels.get(this.name)?.subject.next(message),
    );
  addEventListener = jest
    .fn()
    .mockImplementation((_type, listener: (message: MessageEvent) => void) => {
      channels
        .get(this.name)
        ?.subject.pipe(takeUntil(this.#destroy))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        .subscribe((data) => {
          listener(new MessageEvent('message', { data }));
        });
    });
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SyncState,
        { provide: SyncStateRootConfig, useValue: rootConfig },
        { provide: SyncStateStrategy, useClass: BeforeAppInit },
        provideMockStore({ initialState }),
      ],
    });

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
      expect(channels.get('test-b')?.instance.postMessage).toBeCalledTimes(1);
      expect(channels.get('test-b')?.instance.postMessage).toHaveBeenCalledWith(
        {
          valueB: {
            a: 2,
          },
        },
      );

      tick(15);
      expect(channels.get('test-a-c')?.instance.postMessage).toBeCalledTimes(1);
      expect(
        channels.get('test-a-c')?.instance.postMessage,
      ).toHaveBeenCalledWith({
        valueA: 2,
        valueC: 'd',
      });

      service.ngOnDestroy();
    }));

    it('should not post message after state snc', fakeAsync(() => {
      service.addRoot();

      const state = { valueB: { a: 2, valueA: 2, valueC: 'd' } };
      channels.get('test-b')?.instance.postMessage(state);
      tick();

      store.setState({
        test: {
          ...state,
          valueA: 2,
          valueC: 'd',
        },
      });

      tick();
      channels.get('test-b')?.instance.postMessage.mockReset();
      expect(channels.get('test-b')?.instance.postMessage).not.toBeCalled();
      service.ngOnDestroy();
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
      expect(listen).toBeCalledTimes(1);
      service.ngOnDestroy();
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
});
