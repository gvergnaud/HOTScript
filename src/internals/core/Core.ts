import { ExcludePlaceholders, MergeArgs } from "./impl/MergeArgs";
import { Head } from "../helpers";

export declare const rawArgs: unique symbol;
export type rawArgs = typeof rawArgs;

/**
 * Base interface for all functions.
 *
 * @description You need to extend this interface to create a function
 * that can be composed with other HOTScript functions.
 * Usually you will just convert some utility type you already have
 * by wrapping it inside a HOTScript function.
 *
 * Use `this['args']`, `this['arg0']`, `this['arg1']` etc to access
 * function arguments.
 *
 * The `return` property is the value returned by your function.
 *
 * @example
 * ```ts
 * export interface CustomOmitFn extends Fn {
 *  return: Omit<this['arg0'], this['arg1']>
 * }
 *
 * type T = Call<CustomOmitFn, { a, b, c }, 'a'> // { b, c }
 * ```
 */
export interface Fn {
  [rawArgs]: unknown;
  args: this[rawArgs] extends infer args extends unknown[] ? args : never;
  arg0: this[rawArgs] extends [infer arg, ...any] ? arg : never;
  arg1: this[rawArgs] extends [any, infer arg, ...any] ? arg : never;
  arg2: this[rawArgs] extends [any, any, infer arg, ...any] ? arg : never;
  arg3: this[rawArgs] extends [any, any, any, infer arg, ...any] ? arg : never;
  return: unknown;
}

export declare const unset: unique symbol;
export declare const _: unique symbol;

/**
 * A placeholder type that can be used to indicate that a parameter is not set.
 */
export type unset = typeof unset;

/**
 * A placeholder type that can be used to indicate that a parameter is to partially applied.
 */
export type _ = typeof _;

export interface arg<Index extends number, Constraint = unknown> extends Fn {
  return: this["args"][Index] extends infer arg extends Constraint
    ? arg
    : never;
}

export interface args<Constraint extends unknown[] = unknown[]> extends Fn {
  return: this["args"] extends infer args extends Constraint ? args : never;
}

export type arg0<Constraint = unknown> = arg<0, Constraint>;
export type arg1<Constraint = unknown> = arg<1, Constraint>;
export type arg2<Constraint = unknown> = arg<2, Constraint>;
export type arg3<Constraint = unknown> = arg<3, Constraint>;

/**
 * Call a HOTScript function with the given arguments.
 *
 * @param fn - The function to call.
 * @param args - The arguments to pass to the function.
 * @returns The result of the function.
 *
 * @example
 * ```ts
 * type T0 = Apply<Numbers.Add, [1, 2]>; // 3
 * ```
 */
export type Apply<fn extends Fn, args extends unknown[]> = (fn & {
  [rawArgs]: args;
})["return"];

/**
 * Calls a HOTScript function.
 *
 * @param fn - The function to call.
 * @param ...args - optional arguments
 *
 * @example
 * ```ts
 * type T0 = Call<Numbers.Add<1, 2>>; // 3
 * type T1 = Call<Numbers.Add<1>, 2>; // 3
 * type T2 = Call<Numbers.Add, 1, 2>; // 3
 * type T3 = Call<
 *    Tuples.Map<Strings.Split<".">, ["a.b", "b.c"]>
 * >; // [["a", "b"], ["b", "c"]]
 * ```
 */
export type Call<
  fn extends Fn,
  arg0 = _,
  arg1 = _,
  arg2 = _,
  arg3 = _
> = (fn & {
  [rawArgs]: ExcludePlaceholders<[arg0, arg1, arg2, arg3]>;
})["return"];

/**
 * Pipe a value through a list of functions.
 * @description This is the same as the pipe operator in other languages.
 * Calls the first function with the initial value, then passes the result to the second function, and so on.
 *
 * @param acc - The initial value to pass to the first function.
 * @param xs - The list of functions to pipe the value through.
 * @returns The result of the last function.
 *
 * @example
 * ```ts
 * type T0 = Pipe<1, [Numbers.Add<1>, Numbers.Negate]>; // -2
 * ```
 */
export type Pipe<acc, xs extends Fn[]> = xs extends [
  infer first extends Fn,
  ...infer rest extends Fn[]
]
  ? Pipe<Call<first, acc>, rest>
  : acc;

/**
 * Pipe a value through a list of functions.
 * @description This is the same as the pipe operator in other languages.
 * Calls the last function with the initial value, then passes the result to the second to last function, and so on.
 *
 * @param xs - The list of functions to pipe the value through.
 * @param acc - The initial value to pass to the last function.
 * @returns The result of the first function.
 *
 * @example
 * ```ts
 * type T0 = PipeRight<[Numbers.Add<1>, Numbers.Negate], 1>; // 0
 */
export type PipeRight<xs extends Fn[], acc> = xs extends [
  ...infer rest extends Fn[],
  infer last extends Fn
]
  ? PipeRight<rest, Call<last, acc>>
  : acc;

/**
 * Returns the the function's first argument.
 *
 * @param arg0 - The function to extract the first argument from.
 * @returns The first argument of the function.
 */
export interface Identity extends Fn {
  return: this["arg0"];
}

/**
 * A function that returns it's generic parameter.
 *
 * @param T - The type to return.
 * @returns The type `T`.
 */
export interface Constant<T> extends Fn {
  return: T;
}

/**
 * Composes a list of functions into a single function that passes the result of each function to the next.
 * Executes the functions from right to left.
 *
 * @param fns - The list of functions to compose.
 * @returns The composed function.
 *
 * @example
 * ```ts
 * type T0 = Call<Compose< [T.Join<'-'>,S.Split<'.'> ]>, 'a.b.c'>; // 'a-b-c'
 * ```
 */
export interface Compose<fns extends Fn[]> extends Fn {
  return: ComposeImpl<fns, this["args"]>;
}

type ComposeImpl<fns extends Fn[], args extends any[]> = fns extends [
  ...infer rest extends Fn[],
  infer last extends Fn
]
  ? ComposeImpl<rest, [Apply<last, args>]>
  : Head<args>;

/**
 * Composes a list of functions into a single function that passes the result of each function to the next.
 * Executes the functions from left to right.
 *
 * @param fns - The list of functions to compose.
 * @returns The composed function.
 *
 * @example
 * ```ts
 * type T0 = Call<ComposeLeft< [S.Split<'.'>,T.Join<'-'> ]>, 'a.b.c'>; // 'a-b-c'
 * ```
 */
export interface ComposeLeft<fns extends Fn[]> extends Fn {
  return: ComposeLeftImpl<fns, this["args"]>;
}

type ComposeLeftImpl<fns extends Fn[], args extends any[]> = fns extends [
  infer first extends Fn,
  ...infer rest extends Fn[]
]
  ? ComposeLeftImpl<rest, [Apply<first, args>]>
  : Head<args>;

/**
 * `PartialApply` Pre applies some arguments to a function.
 * it takes a `Fn`, and a list of pre applied arguments,
 * and returns a new function taking the rest of these arguments.
 *
 * Most functions in HOTScript are already partially applicable (curried).
 *
 * @param fn - The function to partially apply.
 * @param partialArgs - The arguments to partially apply.
 * @returns The partially applied function.
 *
 * @example
 * ```ts
 * interface Append extends Fn {
 *    return: [...this['arg1'], this['arg0']]
 * }
 *
 * type Append1 = PartialApply<Append, [1]>
 * type T0 = Call<Append1, [0]>; // [0, 1]
 *
 * type AppendTo123 = PartialApply<Append, [_, [1, 2, 3]]>
 * type T1 = Call<AppendTo123, 4>; // [1, 2, 3, 4]
 */
export interface PartialApply<fn extends Fn, partialArgs extends unknown[]>
  extends Fn {
  return: MergeArgs<
    this["args"],
    partialArgs
  > extends infer args extends unknown[]
    ? Apply<fn, args>
    : never;
}
