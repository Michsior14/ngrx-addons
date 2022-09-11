// Based on https://github.com/ngneat/elf/blob/master/packages/persist-state/src/lib/exclude-keys.ts
import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Exclude keys from the state
 */
export const excludeKeys = <T extends object>(
  keys: (keyof T)[]
): OperatorFunction<T, Partial<T>> => {
  return pipe(
    map((state) =>
      Object.keys(state).reduce<Partial<T>>((toSave, key) => {
        if (!keys.includes(key as keyof T)) {
          toSave[key as keyof T] = state[key as keyof T];
        }
        return toSave;
      }, {})
    )
  );
};
