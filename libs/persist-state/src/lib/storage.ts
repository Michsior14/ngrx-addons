// Based on https://github.com/ngneat/elf/blob/master/packages/persist-state/src/lib/storage.ts
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

export type Async<T> = Promise<T> | Observable<T>;

export interface StateStorage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItem<T extends Record<string, any>>(
    key: string,
  ): Async<T | null | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem(key: string, value: Record<string, any>): Async<any>;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  removeItem(key: string): Async<boolean | void>;
}

export const noopStorage: StateStorage = {
  getItem: () => of(null),
  setItem: () => of(true),
  removeItem: () => of(true),
};

export const createStorage = (storage: Storage | undefined): StateStorage => {
  if (!storage) {
    return noopStorage;
  }

  return {
    getItem: <T>(key: string): Async<T | null | undefined> => {
      const v = storage.getItem(key);
      return of(v ? JSON.parse(v) : v);
    },
    setItem: (key: string, value: Record<string, unknown>): Async<unknown> => {
      storage.setItem(key, JSON.stringify(value));
      return of(true);
    },
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    removeItem: (key: string): Async<boolean | void> => {
      storage.removeItem(key);
      return of(true);
    },
  };
};

// we need to wrap the access to window.localStorage and window.sessionStorage in a try catch
// because localStorage can be disabled, or be denied by a security rule
// as soon as we access the property, it throws an error
const tryGetLocalStorage = (): Storage | undefined => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Ignore error
  }
  return undefined;
};
export const localStorageStrategy = createStorage(tryGetLocalStorage());

const tryGetSessionStorage = (): Storage | undefined => {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }
  } catch {
    // Ignore error
  }
  return undefined;
};
export const sessionStorageStrategy = createStorage(tryGetSessionStorage());
