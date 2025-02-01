import { Apply, Call, Fn } from "../../core/Core";
import { Strings } from "../../strings/Strings";
import {
  Equal,
  IsTuple,
  Prettify,
  Primitive,
  UnionToIntersection,
} from "../../helpers";

export type Keys<src> = src extends readonly unknown[]
  ? {
      [key in keyof src]: key;
    }[number] extends infer res
    ? res extends string
      ? Call<Strings.ToNumber, res> & keyof src
      : res & keyof src
    : never
  : keyof src;

export type Values<src> = Keys<src> extends infer keys extends keyof src
  ? src[keys]
  : never;

export type FromEntries<entries extends [PropertyKey, any]> =
  | {
      [entry in entries as entry[0]]: entry[1];
    }
  // prettifies the name.
  | never;

export type Entries<T> = Keys<T> extends infer keys extends keyof T
  ? {
      [K in keys]: [K, T[K]];
    }[keys]
  : never;

export type Assign<xs extends readonly any[]> = Prettify<
  UnionToIntersection<xs[number]>
>;

export type GetFromPath<Obj, path> = RecursiveGet<Obj, ParsePath<path>>;

type ParsePath<
  path,
  output extends string[] = [],
  currentChunk extends string = ""
> = path extends number
  ? [`${path}`]
  : path extends `${infer first}${infer rest}`
  ? first extends "." | "[" | "]"
    ? ParsePath<
        rest,
        [...output, ...(currentChunk extends "" ? [] : [currentChunk])],
        ""
      >
    : ParsePath<rest, output, `${currentChunk}${first}`>
  : [...output, ...(currentChunk extends "" ? [] : [currentChunk])];

type RecursiveGet<Obj, pathList> = Obj extends any
  ? pathList extends [infer first, ...infer rest]
    ? first extends keyof Obj
      ? RecursiveGet<Obj[first], rest>
      : [first, Obj] extends [`${number}` | "number", readonly any[]]
      ? RecursiveGet<Extract<Obj, any[]>[number], rest>
      : undefined
    : Obj
  : never;

export type TransformObjectDeep<fn extends Fn, type> = type extends
  | Function
  | Date
  ? type
  : type extends Map<infer keys, infer values>
  ? Map<TransformObjectDeep<fn, keys>, TransformObjectDeep<fn, values>>
  : type extends ReadonlyMap<infer keys, infer values>
  ? ReadonlyMap<TransformObjectDeep<fn, keys>, TransformObjectDeep<fn, values>>
  : type extends WeakMap<infer keys, infer values>
  ? WeakMap<
      Extract<TransformObjectDeep<fn, keys>, object>,
      TransformObjectDeep<fn, values>
    >
  : type extends Set<infer values>
  ? Set<TransformObjectDeep<fn, values>>
  : type extends ReadonlySet<infer values>
  ? ReadonlySet<TransformObjectDeep<fn, values>>
  : type extends WeakSet<infer values>
  ? WeakSet<Extract<TransformObjectDeep<fn, values>, object>>
  : type extends Array<infer values>
  ? IsTuple<type> extends true
    ? Call<fn, { [Key in keyof type]: TransformObjectDeep<fn, type[Key]> }>
    : Array<TransformObjectDeep<fn, values>>
  : type extends Promise<infer value>
  ? Promise<TransformObjectDeep<fn, value>>
  : type extends object
  ? Call<fn, { [Key in keyof type]: TransformObjectDeep<fn, type[Key]> }>
  : Equal<type, unknown> extends true
  ? unknown
  : Partial<type>;

export type Update<obj, path, fnOrValue> = RecursiveUpdate<
  obj,
  ParsePath<path>,
  fnOrValue
>;

type RecursiveUpdate<obj, pathList, fnOrValue> = obj extends any
  ? pathList extends [infer first, ...infer rest]
    ? first extends keyof obj
      ? {
          [K in keyof obj]: Equal<first, K> extends true
            ? RecursiveUpdate<obj[K], rest, fnOrValue>
            : obj[K];
        }
      : [first, obj] extends ["number", readonly any[]]
      ? RecursiveUpdate<Extract<obj, any[]>[number], rest, fnOrValue>[]
      : Assign<
          [
            obj,
            {
              [K in Extract<first, PropertyKey>]: RecursiveUpdate<
                {},
                rest,
                fnOrValue
              >;
            }
          ]
        >
    : fnOrValue extends Fn
    ? Call<Extract<fnOrValue, Fn>, obj>
    : fnOrValue
  : never;

export type Create<
  pattern,
  args extends unknown[]
> = pattern extends infer p extends Fn
  ? Apply<p, args>
  : pattern extends Primitive
  ? pattern
  : pattern extends readonly [any, ...any]
  ? { [key in keyof pattern]: Create<pattern[key], args> }
  : pattern extends readonly (infer V)[]
  ? Create<V, args>[]
  : pattern extends object
  ? { [key in keyof pattern]: Create<pattern[key], args> }
  : pattern;

type JoinPath<A extends string, B extends string, Sep extends string = ""> = [
  A
] extends [never]
  ? B
  : [B] extends [never]
  ? A
  : `${A}${Sep}${B}`;

export type AllPaths<T, ParentPath extends string = never> = T extends Primitive
  ? ParentPath
  : unknown extends T
  ? JoinPath<ParentPath, string, ".">
  : T extends readonly any[]
  ? Keys<T> extends infer key extends string | number
    ?
        | JoinPath<ParentPath, `[${key}]`>
        | AllPaths<T[number], JoinPath<ParentPath, `[${key}]`>>
    : never
  : keyof T extends infer key extends keyof T & string
  ? key extends any
    ?
        | JoinPath<ParentPath, key, ".">
        | AllPaths<T[key], JoinPath<ParentPath, key, ".">>
    : never
  : ParentPath;
