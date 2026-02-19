---
sidebar_position: 1
---

# Getting Started

Synchronize your NgRx store state across multiple browser tabs and windows using the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API).

## Installation

```bash
npm i @ngrx-addons/sync-state
```

## Root State Synchronization

### Standalone API (recommended)

```ts
import { provideStore } from '@ngrx/store';
import { provideSyncStore } from '@ngrx-addons/sync-state';

const counterReducer = ...;
const reducers = { counter: counterReducer } as const;

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(reducers),
    provideSyncStore<typeof reducers>({
      states: [{ key: 'counter' }],
    }),
  ],
});
```

### NgModule API

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SyncStateModule } from '@ngrx-addons/sync-state';

const counterReducer = ...;
const reducers = { counter: counterReducer } as const;

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    SyncStateModule.forRoot<typeof reducers>({
      states: [{ key: 'counter' }],
    }),
  ],
})
export class AppModule {}
```

## Feature State Synchronization

### Standalone API (recommended)

```ts
import { provideStore, provideState } from '@ngrx/store';
import { provideSyncStore, provideSyncState } from '@ngrx-addons/sync-state';

interface CounterState {
  count: number;
}

const counterReducer = ...;

// Root module
bootstrapApplication(AppComponent, {
  providers: [
    provideStore(),
    provideSyncStore(),
  ],
});

// Feature route/module
const counterRoutes: Route[] = [
  {
    path: 'counter',
    providers: [
      provideState('counter', counterReducer),
      provideSyncState<CounterState>({
        key: 'counter',
        states: [{}],
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
import { SyncStateModule } from '@ngrx-addons/sync-state';

interface CounterState {
  count: number;
}

const counterReducer = ...;

@NgModule({
  imports: [
    StoreModule.forRoot(),
    SyncStateModule.forRoot(),
  ],
})
export class AppModule {}

@NgModule({
  imports: [
    StoreModule.forFeature('counter', counterReducer),
    SyncStateModule.forFeature<CounterState>({
      key: 'counter',
      states: [{}],
    }),
  ],
})
export class CounterModule {}
```

:::note
Always call `forRoot()` / `provideSyncStore()` in your root module, even if you only use feature states.
:::

## Sync Action

When state is received from another tab, the `storeSyncAction` (type: `@ngrx-addons/sync-state/sync`) is dispatched with the synced `features`. You can use it in effects:

```ts
import { storeSyncAction } from '@ngrx-addons/sync-state';

this.actions$.pipe(
  ofType(storeSyncAction),
  tap(({ features }) => console.log('Synced from another tab:', features)),
);
```
