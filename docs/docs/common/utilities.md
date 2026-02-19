---
sidebar_position: 4
---

# Common Utilities

The `@ngrx-addons/common` package provides shared utilities used by both `persist-state` and `sync-state`. You can also use them independently.

## Key Filtering Operators

### `excludeKeys`

An RxJS operator that removes specified keys from the emitted state object:

```ts
import { excludeKeys } from '@ngrx-addons/common';

state$.pipe(excludeKeys(['temporaryFlag', 'loading']));
// { count: 1, temporaryFlag: true, loading: false }
// → { count: 1 }
```

### `includeKeys`

An RxJS operator that keeps only the specified keys:

```ts
import { includeKeys } from '@ngrx-addons/common';

state$.pipe(includeKeys(['count', 'name']));
// { count: 1, name: 'test', loading: false }
// → { count: 1, name: 'test' }
```

## `isEqual`

A deep equality comparison function used internally by `distinctUntilChanged` to prevent unnecessary storage writes / broadcasts:

```ts
import { isEqual } from '@ngrx-addons/common';

isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
isEqual({ a: 1 }, { b: 1 }); // false
isEqual([1, 2, 3], [1, 2, 3]); // true
```

## Initialization Strategies

### `BeforeAppInit`

Resolves immediately. State is rehydrated / synced before `APP_INITIALIZER` completes.

This is the **default** strategy for both `persist-state` and `sync-state`.

### `AfterAppInit`

Resolves only after `markAsInitialized()` is called. Useful when your app initializers need the default state before rehydration:

```ts
import { AfterAppInit } from '@ngrx-addons/common';

// In your provider config
providePersistStore({
  strategy: AfterAppInit,
  states: [...],
});

// In your root component
@Component({ ... })
export class AppComponent {
  private readonly afterAppInit = inject(AfterAppInit);

  ngOnInit() {
    // Trigger rehydration after your initialization logic
    this.afterAppInit.markAsInitialized();
  }
}
```

The `afterAppInitProvider` is automatically included when you use `providePersistStore` or `provideSyncStore`.
