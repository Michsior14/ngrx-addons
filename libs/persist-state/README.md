# @ngrx-addons/persist-state

The library for persisting state in ngrx. Highly inspired by [@ngneat/elf-persist-state](https://github.com/ngneat/elf/tree/master/packages/persist-state).
Supports local storage, session storage and async storages with [localForage](https://github.com/localForage/localForage).

## Supported versions

- `angular` 14+
- `@ngrx/store` 14+

## Installation

```bash
npm i @ngrx-addons/persist-state
```

or

```bash
yarn add @ngrx-addons/persist-state
```

## Usage

The module gives ability to persist some of the app’s states, by saving it to `localStorage/sessionStorage` or anything that implements the `StorageEngine API`, and restore it after a refresh. It supports both root and feature states. The only thing you need to do is to add `PersistStateModule.forRoot` to your `AppModule` or `PersistStateModule.forFeature` to your feature module.

### For root states

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-store';

const counterReducer = ...;
const reducers = {
  counter: counterReducer,
} as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    // type provided for hints on states
    PersistStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          // the package exposes localStorageStrategy and 
          // sessionStorageStrategy, optionally you can 
          // provide your own implementation or even  
          // use localForage for indexed db.
          storage: localStorageStrategy 
          // optional options (default values)
          runGuard: () => typeof window !== 'undefined',
          source: (state) => state,
          storageKey: `${storageKeyPrefix}-${key}@store`,
        },
        // next states to persist, same reducer key can be
        // specified multiple times to save parts of the state
        // to different storages
      ],
      // optional root options (for all, also feature states)
      storageKeyPrefix: 'some-prefix',
    }),
  ],
})
export class AppModule {}
```

The `forRoot` method accepts an object with the following properties:

- `states` - array of states configs (defined below, required)
- `storageKeyPrefix` - prefix for all storage keys (optional)

Each state can be described by multiple state configs with the following properties:

- `key` - the reducer key in app state (required)
- `storage`: an object or function resolving to an object with async setItem, getItem and removeItem methods for storing the state. The package exposes `localStorageStrategy` or `sessionStorageStrategy`, excepts also a `localForage` instance (required).
- `source`: a method that receives the observable of a state and return what to save from it (by default - the entire state).
- `storageKey`: the name under which the store state is saved (by default - the prefix plus store name plus a `@store` suffix).
- `runGuard` - returns whether the actual implementation should be run. The default is `() => typeof window !== 'undefined'`

### For feature states

Remember to add features only once, in any case only the first registration will be used.

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-store';

interface CounterState {
  count: number;
}
const counterReducer = ...;

@NgModule({
  imports: [
    StoreModule.forFeature('counter', reducer),
    // type provided for hints on states
    PersistStateModule.forFeature<CounterState>({
      key: 'counter',
      states: [
        {
          // The same options as for root states, except the key
          storage: localStorageStrategy 
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

Once the state is rehydrated, the action (`rehydrated`, type: `@ngrx-addons/persist-state/rehydrate`) with the proper `features` is dispatched (multiple times). You can use it to react in `effects` or `meta-reducers`.

## Excluding keys from the state​

The `excludeKeys()` operator can be used to exclude keys from the state:

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PersistStateModule, excludeKeys, localStorageStrategy } from '@ngrx-addons/persist-store';

const counterReducer = ...;
const reducers = {
  counter: counterReducer,
} as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    PersistStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          storage: localStorageStrategy,
          source: (state) => state.pipe(excludeKeys(['a', 'b'])),
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### Performance Optimization​

By default, the module will update the storage upon each state changes (`distinctUntilChanged` with object equality check is applied). Some applications perform multiple updates in a second, and update the storage on each change can be costly.

For such cases, it's recommended to use the `debounceTime` operator. For example:

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-store';

const counterReducer = ...;
const reducers = {
  counter: counterReducer,
} as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    PersistStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          storage: localStorageStrategy,
          source: (state) => state.pipe(debounceTime(1000)),
        },
      ],
    }),
  ],
})
export class AppModule {}
```
