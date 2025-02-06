import { Call, PartialApply } from "../../core/Core";
import * as H from "../../helpers";
import { Tuples } from "../../tuples/Tuples";
import { Match } from "./match";
import { RegExpStruct } from "./regexp";

type ConcatSplits<
  Parts extends string[],
  Seps extends string[],
  Acc extends string[] = []
> = Parts extends [infer First extends string, ...infer Rest extends string[]]
  ? ConcatSplits<Rest, Seps, [...Acc, ...SplitManySep<First, Seps>]>
  : Acc;

type SplitManySep<
  Str extends string,
  Sep extends string[],
  Acc extends string[] = []
> = Sep extends [
  infer FirstSep extends string,
  ...infer RestSep extends string[]
]
  ? ConcatSplits<H.Split<Str, FirstSep>, RestSep>
  : [Str, ...Acc];

/**
 * Split a string into a tuple.
 * @param Str - The string to split.
 * @param Sep - The separator to split on, can be a union of strings of more than one character, or a union of RegExp pattern `Strings.RegExp` (support `i` flag)
 * @returns The tuple of each split. if sep is an empty string, returns a tuple of each character.
 */
export type Split<
  Str,
  Sep extends string | RegExpStruct<string, any>,
  Seps = keyof RegExpStruct<string> extends keyof Sep
    ? H.UnionToTuple<Sep> extends infer REs extends RegExpStruct<string, any>[]
      ? H.UnionToTuple<
          Call<
            Tuples.FlatMap<PartialApply<Match, [Str]>>,
            {
              [K in keyof REs]: RegExpStruct<
                REs[K]["pattern"],
                REs[K]["flags"] | "g",
                REs[K]["parsedMatchers"]
              >;
            }
          >[number]
        >
      : never
    : H.UnionToTuple<Sep>
> = H.IsNever<Seps> extends true
  ? [...(Str extends "" ? [] : [Str])]
  : Seps extends string[]
  ? Str extends string
    ? SplitManySep<Str, Seps>
    : []
  : [];

/**
 * Split a string into a tuple with each character.
 * @param Str - The string to split.
 * @returns The tuple of each character.
 */
export type StringToTuple<Str, Acc extends string[] = []> = Str extends string
  ? Str extends `${infer First}${infer Rest}`
    ? StringToTuple<Rest, [...Acc, First]>
    : Acc
  : [];
