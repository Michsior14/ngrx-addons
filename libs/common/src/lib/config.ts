// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type State<T extends AnyFunction> = Writable<
  NonNullable<Parameters<T>[0]>
>;
