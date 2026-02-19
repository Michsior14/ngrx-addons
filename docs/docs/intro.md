---
slug: /
sidebar_position: 1
---

# Introduction

**ngrx-addons** is a collection of addons for [NgRx](https://ngrx.io/) that extend the store with state persistence and cross-tab synchronization.

## Packages

| Package                                                         | Description                                                           | npm                                                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`@ngrx-addons/persist-state`](./persist-state/getting-started) | Persist NgRx state to localStorage, sessionStorage, or custom storage | [![npm](https://img.shields.io/npm/v/@ngrx-addons/persist-state)](https://www.npmjs.com/package/@ngrx-addons/persist-state) |
| [`@ngrx-addons/sync-state`](./sync-state/getting-started)       | Sync NgRx state across browser tabs via Broadcast Channel API         | [![npm](https://img.shields.io/npm/v/@ngrx-addons/sync-state)](https://www.npmjs.com/package/@ngrx-addons/sync-state)       |
| [`@ngrx-addons/common`](./common/utilities)                     | Shared utilities used by both libraries                               | [![npm](https://img.shields.io/npm/v/@ngrx-addons/common)](https://www.npmjs.com/package/@ngrx-addons/common)               |

## Compatibility

| Dependency    | Required version |
| ------------- | ---------------- |
| Angular       | `>=19.0.0`       |
| `@ngrx/store` | `>=19.0.0`       |
| RxJS          | `>=7.0.0`        |

## Quick Start

```bash
npm i @ngrx-addons/persist-state
# or
npm i @ngrx-addons/sync-state
```

Both packages include `@ngrx-addons/common` as a dependency — no need to install it separately.
