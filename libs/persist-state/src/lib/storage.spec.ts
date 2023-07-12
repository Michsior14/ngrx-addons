import { waitForAsync } from '@angular/core/testing';
import { firstValueFrom, from } from 'rxjs';
import type { Async } from './storage';
import { createStorage, noopStorage } from './storage';

describe('storage', () => {
  describe('noopStorage', () => {
    it('should return mocked values', waitForAsync(() => {
      from(noopStorage.getItem('key')).subscribe((value) =>
        { expect(value).toBeNull(); }
      );
      from(noopStorage.setItem('key', {})).subscribe((value) =>
        { expect(value).toBe(true); }
      );
      from(noopStorage.removeItem('key')).subscribe((value) =>
        { expect(value).toBe(true); }
      );
    }));
  });

  describe('createStorage', () => {
    it('should return noopStorage if storage is undefined', () => {
      const storage = createStorage(undefined);
      expect(storage).toEqual(noopStorage);
    });

    it('should stringify/parse on object implementing WebStorage API ', async () => {
      const promise = <T>(fn: Async<T>) => firstValueFrom(from(fn));
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
      expect(implementation.setItem).toBeCalledWith(
        key,
        JSON.stringify(testObject)
      );

      await promise(storage.removeItem(key));
      expect(implementation.removeItem).toBeCalledWith(key);
    });
  });
});
