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

| Property   | Type                                 | Default                 | Description                                                                                                                                   |
| ---------- | ------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`      | `string`                             | —                       | **Required.** The reducer key in app state                                                                                                    |
| `channel`  | `string`                             | `${prefix}${key}@store` | The Broadcast Channel name                                                                                                                    |
| `source`   | `(state$: Observable) => Observable` | `(state) => state`      | Transform the state before broadcasting                                                                                                       |
| `runGuard` | `() => boolean`                      | see below               | Whether syncing should run                                                                                                                    |
| `skip`     | `number`                             | `1`                     | Number of state changes to skip once syncing starts, so a newly opened tab doesn't send its initial state. `undefined` values aren't counted. |

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

Register each feature only once. If the same key is registered more than once, only the first configuration is used, and the state is synced until every registration is removed.

## Sync Behavior

- Only changes are sent. With the default `skip: 1`, a newly opened tab doesn't send its initial state to the other tabs.
- A received state is never sent back, even if a reducer changes it while handling `storeSyncAction`.
- `undefined` values, for example from a feature whose reducer isn't registered yet, are never sent.
- The Broadcast Channel is opened when syncing starts (see `strategy`) and closed when syncing stops.

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

## Error Handling

Errors are reported to Angular's `ErrorHandler`, and the other states keep syncing:

- If a value can't be sent, for example because it contains a function that Broadcast Channel can't copy, later changes are still sent.
- If a state's `source` fails, only that state stops syncing.

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
