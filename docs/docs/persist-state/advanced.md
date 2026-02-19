---
sidebar_position: 3
---

# Advanced Usage

## Excluding / Including Keys

Use the `excludeKeys()` and `includeKeys()` operators from `@ngrx-addons/common` to control which parts of the state are persisted:

```ts
import { excludeKeys, includeKeys } from '@ngrx-addons/common';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-state';

PersistStateModule.forRoot<typeof reducers>({
  states: [
    {
      key: 'counter',
      storage: localStorageStrategy,
      // Only persist specific keys
      source: (state) => state.pipe(includeKeys(['count', 'name'])),
      // Or exclude specific keys
      // source: (state) => state.pipe(excludeKeys(['temporaryFlag'])),
    },
  ],
});
```

## Performance Optimization

By default, state is saved on every change (with a `distinctUntilChanged` check). For high-frequency updates, use `debounceTime`:

```ts
import { debounceTime } from 'rxjs/operators';
import { localStorageStrategy } from '@ngrx-addons/persist-state';

providePersistStore({
  states: [
    {
      key: 'counter',
      storage: localStorageStrategy,
      source: (state) => state.pipe(debounceTime(1000)),
    },
  ],
});
```

## Multiple Storages for the Same Key

You can persist different parts of the same reducer key to different storages:

```ts
providePersistStore({
  states: [
    {
      key: 'user',
      storage: localStorageStrategy,
      source: (state) => state.pipe(includeKeys(['preferences'])),
      storageKey: 'user-prefs@store',
    },
    {
      key: 'user',
      storage: sessionStorageStrategy,
      source: (state) => state.pipe(includeKeys(['session'])),
      storageKey: 'user-session@store',
    },
  ],
});
```

## Initialization Strategies

Control when rehydration happens relative to app initialization:

### `BeforeAppInit` (default)

State is rehydrated immediately, before `APP_INITIALIZER` completes. Your app starts with the persisted state already in the store.

### `AfterAppInit`

State is rehydrated after `APP_INITIALIZER` completes. Useful when your initializers depend on the default state:

```ts
import { AfterAppInit } from '@ngrx-addons/common';

providePersistStore({
  strategy: AfterAppInit,
  states: [...],
});
```

When using `AfterAppInit`, call `markAsInitialized()` to trigger rehydration:

```ts
import { AfterAppInit } from '@ngrx-addons/common';

@Component({ ... })
export class AppComponent {
  private readonly afterAppInit = inject(AfterAppInit);

  ngOnInit() {
    this.afterAppInit.markAsInitialized();
  }
}
```

## Server-Side Rendering (SSR)

The default `runGuard` checks `typeof window !== 'undefined'`, which prevents persistence from running on the server. No additional configuration is needed for Angular Universal / SSR.

For testing, use `noopStorage` to disable persistence entirely:

```ts
import { noopStorage } from '@ngrx-addons/persist-state';

// In your test module
providePersistStore({
  states: [{ key: 'counter', storage: noopStorage }],
});
```

Or provide a custom `runGuard`:

```ts
providePersistStore({
  states: [
    {
      key: 'counter',
      storage: localStorageStrategy,
      runGuard: () => false, // Disable persistence
    },
  ],
});
```
