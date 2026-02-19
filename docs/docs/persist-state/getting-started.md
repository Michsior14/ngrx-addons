---
sidebar_position: 1
---

# Getting Started

Persist your NgRx store state to `localStorage`, `sessionStorage`, or any custom storage that implements the `StateStorage` interface. Supports both root and feature states with automatic rehydration on page reload.

Highly inspired by [@ngneat/elf-persist-state](https://github.com/ngneat/elf/tree/master/packages/persist-state).

## Installation

```bash
npm i @ngrx-addons/persist-state
```

## Root State Persistence

### Standalone API (recommended)

```ts
import { provideStore } from '@ngrx/store';
import { providePersistStore, localStorageStrategy } from '@ngrx-addons/persist-state';

const counterReducer = ...;
const reducers = { counter: counterReducer } as const;

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(reducers),
    providePersistStore<typeof reducers>({
      states: [
        {
          key: 'counter',
          storage: localStorageStrategy,
        },
      ],
    }),
  ],
});
```

### NgModule API

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-state';

const counterReducer = ...;
const reducers = { counter: counterReducer } as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    PersistStateModule.forRoot<typeof reducers>({
      states: [
        {
          key: 'counter',
          storage: localStorageStrategy,
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Feature State Persistence

### Standalone API (recommended)

```ts
import { provideStore, provideState } from '@ngrx/store';
import {
  providePersistStore,
  providePersistState,
  localStorageStrategy,
} from '@ngrx-addons/persist-state';

interface CounterState {
  count: number;
}

const counterReducer = ...;

// Root module
bootstrapApplication(AppComponent, {
  providers: [
    provideStore(),
    providePersistStore(),
  ],
});

// Feature route/module
const counterRoutes: Route[] = [
  {
    path: 'counter',
    providers: [
      provideState('counter', counterReducer),
      providePersistState<CounterState>({
        key: 'counter',
        states: [{ storage: localStorageStrategy }],
      }),
    ],
    children: [...],
  },
];
```

### NgModule API

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-state';

interface CounterState {
  count: number;
}

const counterReducer = ...;

@NgModule({
  imports: [
    StoreModule.forRoot(),
    PersistStateModule.forRoot(),
  ],
})
export class AppModule {}

@NgModule({
  imports: [
    StoreModule.forFeature('counter', counterReducer),
    PersistStateModule.forFeature<CounterState>({
      key: 'counter',
      states: [{ storage: localStorageStrategy }],
    }),
  ],
})
export class CounterModule {}
```

:::note
Always call `forRoot()` / `providePersistStore()` in your root module, even if you only use feature states.
:::

## Rehydration Action

Once state is rehydrated from storage, the `rehydrate` action (type: `@ngrx-addons/persist-state/rehydrate`) is dispatched with the restored `features`. You can use it in effects or meta-reducers:

```ts
import { rehydrate } from '@ngrx-addons/persist-state';

// In an effect
this.actions$.pipe(
  ofType(rehydrate),
  tap(({ features }) => console.log('Rehydrated:', features)),
);
```
