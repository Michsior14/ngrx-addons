---
sidebar_position: 2
---

# Configuration

## Root Configuration

The `forRoot` / `providePersistStore` method accepts an object with the following properties:

| Property           | Type                     | Default         | Description                                                        |
| ------------------ | ------------------------ | --------------- | ------------------------------------------------------------------ |
| `states`           | `PersistStateConfig[]`   | —               | Array of state configs (see below)                                 |
| `storageKeyPrefix` | `string`                 | `''`            | Prefix for all storage keys                                        |
| `strategy`         | `InitializationStrategy` | `BeforeAppInit` | When to fire rehydrate actions (`BeforeAppInit` or `AfterAppInit`) |

## State Configuration

Each entry in the `states` array accepts:

| Property     | Type                                 | Default                               | Description                                                                                                                                                                                                 |
| ------------ | ------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`        | `string`                             | —                                     | **Required.** The reducer key in app state                                                                                                                                                                  |
| `storage`    | `StateStorage \| () => StateStorage` | —                                     | **Required.** Storage backend. The package provides `localStorageStrategy`, `sessionStorageStrategy`, and `noopStorage`. Also accepts a [localForage](https://github.com/localForage/localForage) instance. |
| `source`     | `(state$: Observable) => Observable` | `(state) => state`                    | Transform the state before saving (e.g. filter keys)                                                                                                                                                        |
| `storageKey` | `string`                             | `${prefix}${key}@store`               | The key under which the state is stored                                                                                                                                                                     |
| `runGuard`   | `() => boolean`                      | `() => typeof window !== 'undefined'` | Whether persistence should run. Returns `false` in SSR.                                                                                                                                                     |
| `skip`       | `number`                             | `1`                                   | Number of state changes to skip before persisting (skips the initial state)                                                                                                                                 |
| `migrations` | `Migration[]`                        | `[]`                                  | Array of migrations to run before rehydration                                                                                                                                                               |

## Feature Configuration

The `forFeature` / `providePersistState` method accepts:

| Property | Type                   | Description                                                   |
| -------- | ---------------------- | ------------------------------------------------------------- |
| `key`    | `string`               | **Required.** The feature key                                 |
| `states` | `PersistStateConfig[]` | **Required.** Same as root state config, except without `key` |

## Storage Strategies

The package exports three built-in storage strategies:

### `localStorageStrategy`

Persists state to `window.localStorage`. Falls back to `noopStorage` if localStorage is unavailable.

### `sessionStorageStrategy`

Persists state to `window.sessionStorage`. Falls back to `noopStorage` if sessionStorage is unavailable.

### `noopStorage`

A no-op storage that does nothing. Useful for testing or explicitly disabling persistence:

```ts
import { noopStorage } from '@ngrx-addons/persist-state';

providePersistStore({
  states: [{ key: 'counter', storage: noopStorage }],
});
```

### Custom Storage

Implement the `StateStorage` interface for custom backends:

```ts
import type { StateStorage } from '@ngrx-addons/persist-state';

const customStorage: StateStorage = {
  getItem: (key) => /* return Observable or Promise */,
  setItem: (key, value) => /* return Observable or Promise */,
  removeItem: (key) => /* return Observable or Promise */,
};
```

You can also use [localForage](https://github.com/localForage/localForage) directly — it implements a compatible interface for IndexedDB, WebSQL, and localStorage.

## Migrations

Migrations allow you to transform persisted state when your state shape changes between versions:

```ts
providePersistStore({
  states: [
    {
      key: 'counter',
      storage: localStorageStrategy,
      migrations: [
        {
          version: 1,
          versionKey: 'version', // default
          migrate: (state) => ({
            ...state,
            newProperty: 'default',
            version: 2,
          }),
        },
      ],
    },
  ],
});
```

Each migration specifies:

| Property     | Type               | Default     | Description                              |
| ------------ | ------------------ | ----------- | ---------------------------------------- |
| `version`    | `string \| number` | —           | The version to migrate **from**          |
| `versionKey` | `string`           | `'version'` | Which key in the state holds the version |
| `migrate`    | `(state) => state` | —           | The migration function                   |

Migrations run sequentially before the `rehydrate` action is dispatched. Add a `version` field to your persisted state to track which migrations have been applied.
