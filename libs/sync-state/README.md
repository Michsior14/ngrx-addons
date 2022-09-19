# @ngrx-addons/sync-state

The library for synchronizing state in ngrx between multiple tabs/iframes/windows. Highly inspired by [elf-sync-state](https://github.com/RicardoJBarrios/elf-sync-state).

## Supported versions

- `angular` 14+
- `@ngrx/store` 14+

## Installation

```bash
npm i @ngrx-addons/sync-state
```

or

```bash
yarn add @ngrx-addons/sync-state
```

## Usage

The module gives ability to sync some of the app’s states using [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). It supports both root and feature states. The only thing you need to do is to add `SyncStateModule.forRoot` to your `AppModule` or `SyncStateModule.forFeature` to your feature module.

### For root states

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SyncStateModule } from '@ngrx-addons/sync-store';

const counterReducer = ...;
const reducers = {
  counter: counterReducer,
} as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    // type provided for hints on states
    SyncStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          // optional options (default values)
          runGuard: () =>
            typeof window !== 'undefined' &&
            typeof window.BroadcastChannel !== 'undefined',
          source: (state) => state,
          channel: `${storageKeyPrefix}-${key}@store`,
          skip: 1
        },
        // next states to sync, same reducer key can be
        // specified multiple times to sync parts of the state
        // using different channels
      ],
      // optional root options (for all, also feature states)
      channelPrefix: 'some-prefix',
    }),
  ],
})
export class AppModule {}
```

The `forRoot` method accepts an object with the following properties:

- `states` - array of states configs (defined below, required)
- `channelPrefix` - prefix for all channels (optional)

Each state can be described by multiple state configs with the following properties:

- `key` - the reducer key in app state (required).
- `source`: a method that receives the observable of a state and return what to save from it (by default - the entire state).
- `channel`: the name under which the store state is synchronized (by default - the prefix plus store name plus a `@store` suffix).
- `runGuard` - returns whether the actual implementation should be run. The default is `typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined'`
- `skip` - The number of state changes skipped before the state is synced. Used to skip the initial state change. The default is `1`.

### For feature states

Remember to add features only once, in any case only the first registration will be used.

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SyncStateModule } from '@ngrx-addons/sync-store';

interface CounterState {
  count: number;
}
const counterReducer = ...;

@NgModule({
  imports: [
    StoreModule.forFeature('counter', reducer),
    // type provided for hints on states
    SyncStateModule.forFeature<CounterState>({
      key: 'counter',
      states: [
        {
          // The same options as for root states, except the key
        },
      ],
    }),
  ],
})
export class AppModule {}
```

The `forFeature` method accepts an object with the following properties:

- `key` - the feature key (required)
- `states` - array of states configs as in `forRoot`, except `key` property (required)

Once the state is synchronized, the action (`storeSyncAction`, type: `@ngrx-addons/sync-state/sync`) with the proper `features` is dispatched (multiple times). You can use it to react in `effects` or `meta-reducers`.

## Excluding/Including keys from the state​

The `excludeKeys()`/`includeKeys()` operator can be used to exclude keys from the state:

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { excludeKeys, includeKeys } from '@ngrx-addons/common';
import { SyncStateModule } from '@ngrx-addons/sync-store';

const counterReducer = ...;
const reducers = {
  counter: counterReducer,
} as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    SyncStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          source: (state) => state.pipe(excludeKeys(['a', 'b'])),
          // source: (state) => state.pipe(includeKeys(['a', 'b'])),
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Examples

Check the [examples app](../../apps/examples)
