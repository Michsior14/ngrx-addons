import { waitForAsync } from '@angular/core/testing';
import { firstValueFrom, from } from 'rxjs';
import type { Async } from './storage';
import {
  createStorage,
  localStorageStrategy,
  noopStorage,
  sessionStorageStrategy,
} from './storage';

describe('storage', () => {
  describe('noopStorage', () => {
    it('should return null for getItem', waitForAsync(() => {
      from(noopStorage.getItem('key')).subscribe((value) => {
        expect(value).toBeNull();
      });
    }));

    it('should return true for setItem', waitForAsync(() => {
      from(noopStorage.setItem('key', {})).subscribe((value) => {
        expect(value).toBe(true);
      });
    }));

    it('should return true for removeItem', waitForAsync(() => {
      from(noopStorage.removeItem('key')).subscribe((value) => {
        expect(value).toBe(true);
      });
    }));
  });

  describe('createStorage', () => {
    it('should return noopStorage if storage is undefined', () => {
      const storage = createStorage(undefined);
      expect(storage).toEqual(noopStorage);
    });

    it('should stringify/parse on object implementing WebStorage API', async () => {
      const promise = <T>(fn: Async<T>): Promise<T> => firstValueFrom(from(fn));
      const implementation = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      const storage = createStorage(implementation as never as Storage);

      const key = 'key';
      const testObject = { foo: 'bar' };
      implementation.getItem.mockReturnValue(JSON.stringify(testObject));
      expect(await promise(storage.getItem(key))).toStrictEqual(testObject);

      implementation.getItem.mockReturnValue(undefined);
      expect(await promise(storage.getItem(key))).toStrictEqual(undefined);

      await promise(storage.setItem(key, testObject));
      expect(implementation.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testObject),
      );

      await promise(storage.removeItem(key));
      expect(implementation.removeItem).toHaveBeenCalledWith(key);
    });

    it('should return null for null storage value', async () => {
      const promise = <T>(fn: Async<T>): Promise<T> => firstValueFrom(from(fn));
      const implementation = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      const storage = createStorage(implementation as never as Storage);

      expect(await promise(storage.getItem('key'))).toBeNull();
    });

    it('should handle complex nested objects', async () => {
      const promise = <T>(fn: Async<T>): Promise<T> => firstValueFrom(from(fn));
      const implementation = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      const storage = createStorage(implementation as never as Storage);

      const complexObject = {
        nested: { deep: { value: 1 } },
        array: [1, 2, { inner: 'test' }],
      };
      implementation.getItem.mockReturnValue(JSON.stringify(complexObject));
      expect(await promise(storage.getItem('key'))).toStrictEqual(
        complexObject,
      );
    });
  });

  describe('localStorageStrategy', () => {
    it('should be defined', () => {
      expect(localStorageStrategy).toBeDefined();
      expect(typeof localStorageStrategy.getItem).toBe('function');
      expect(typeof localStorageStrategy.setItem).toBe('function');
      expect(typeof localStorageStrategy.removeItem).toBe('function');
    });
  });

  describe('sessionStorageStrategy', () => {
    it('should be defined', () => {
      expect(sessionStorageStrategy).toBeDefined();
      expect(typeof sessionStorageStrategy.getItem).toBe('function');
      expect(typeof sessionStorageStrategy.setItem).toBe('function');
      expect(typeof sessionStorageStrategy.removeItem).toBe('function');
    });
  });
});
