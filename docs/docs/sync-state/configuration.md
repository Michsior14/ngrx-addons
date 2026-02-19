---
sidebar_position: 2
---

# Configuration

## Root Configuration

The `forRoot` / `provideSyncStore` method accepts an object with the following properties:

| Property        | Type                     | Default         | Description                                               |
| --------------- | ------------------------ | --------------- | --------------------------------------------------------- |
| `states`        | `SyncStateConfig[]`      | —               | Array of state configs (see below)                        |
| `channelPrefix` | `string`                 | `''`            | Prefix for all Broadcast Channel names                    |
| `strategy`      | `InitializationStrategy` | `BeforeAppInit` | When to start syncing (`BeforeAppInit` or `AfterAppInit`) |

## State Configuration

Each entry in the `states` array accepts:

| Property   | Type                                 | Default                 | Description                                    |
| ---------- | ------------------------------------ | ----------------------- | ---------------------------------------------- |
| `key`      | `string`                             | —                       | **Required.** The reducer key in app state     |
| `channel`  | `string`                             | `${prefix}${key}@store` | The Broadcast Channel name                     |
| `source`   | `(state$: Observable) => Observable` | `(state) => state`      | Transform the state before broadcasting        |
| `runGuard` | `() => boolean`                      | see below               | Whether syncing should run                     |
| `skip`     | `number`                             | `1`                     | Number of state changes to skip before syncing |

### Default `runGuard`

```ts
() => typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined';
```

This prevents syncing from running in SSR environments or browsers without Broadcast Channel support.

## Feature Configuration

The `forFeature` / `provideSyncState` method accepts:

| Property | Type                | Description                                                   |
| -------- | ------------------- | ------------------------------------------------------------- |
| `key`    | `string`            | **Required.** The feature key                                 |
| `states` | `SyncStateConfig[]` | **Required.** Same as root state config, except without `key` |

## Filtering Synced State

Use `excludeKeys()` and `includeKeys()` from `@ngrx-addons/common` to control which parts of the state are synced:

```ts
import { excludeKeys } from '@ngrx-addons/common';

provideSyncStore({
  states: [
    {
      key: 'counter',
      source: (state) => state.pipe(excludeKeys(['localOnly'])),
    },
  ],
});
```

## Initialization Strategies

Same as persist-state — see [Initialization Strategies](../persist-state/advanced#initialization-strategies).

## Server-Side Rendering (SSR)

The default `runGuard` already handles SSR by checking for both `window` and `BroadcastChannel`. No additional configuration is needed.

For testing, provide a custom `runGuard`:

```ts
provideSyncStore({
  states: [
    {
      key: 'counter',
      runGuard: () => false,
    },
  ],
});
```
