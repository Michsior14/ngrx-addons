import type { InitializationStrategy } from './strategies';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type State<T extends AnyFunction> = Writable<
  NonNullable<Parameters<T>[0]>
>;

export type WithStrategy<T> = T & {
  /**
   * The strategy used on application startup to rehydrate/sync the state.
   *
   * @default BeforeAppInit
   */
  strategy?: typeof InitializationStrategy;
};
