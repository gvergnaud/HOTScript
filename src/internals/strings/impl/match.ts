import { Fn } from "../../core/Core";

import { RegExpStruct } from "./regexp";

import { MatchRegExp, MatchAllRegExp } from "type-level-regexp/regexp";

type PrettifyRegExpMatchArray<RegExpMatchResult> = RegExpMatchResult extends {
  _matchArray: infer MatchArray;
  index: infer Index;
  groups: infer Groups;
}
  ? MatchArray & { index: Index; groups: Groups }
  : null;

export interface Match extends Fn {
  return: this["args"] extends [
    infer Str extends string,
    infer RE extends RegExpStruct<string, any>,
    ...any
  ]
    ? Str extends Str
      ? "g" extends RE["flags"]
        ? MatchRegExp<Str, NonNullable<RE["parsedMatchers"]>, RE["flags"]>
        : PrettifyRegExpMatchArray<
            MatchRegExp<Str, NonNullable<RE["parsedMatchers"]>, RE["flags"]>
          >
      : never
    : never;
}

export interface MatchAll extends Fn {
  return: this["args"] extends [
    infer Str extends string,
    infer RE extends RegExpStruct<string, any>,
    ...any
  ]
    ? Str extends Str
      ? "g" extends RE["flags"]
        ? MatchAllRegExp<Str, RE["parsedMatchers"], RE["flags"]> extends {
            _matchedTuple: infer MatchTuple extends any[];
          }
          ? {
              [Key in keyof MatchTuple]: PrettifyRegExpMatchArray<
                MatchTuple[Key]
              >;
            }
          : null
        : TypeError & {
            msg: "MatchAll called with a non-global RegExp argument";
          }
      : never
    : never;
}
