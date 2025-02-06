import { Fn } from "../../core/Core";
import { RegExpStruct } from "./regexp";

import { ReplaceWithRegExp } from "type-level-regexp/regexp";

export type Replace<
  Str,
  From extends string,
  To extends string
> = Str extends string
  ? Str extends `${infer Before}${From}${infer After}`
    ? Replace<`${Before}${To}${After}`, From, To>
    : Str
  : Str;

export interface ReplaceReducer<To extends string> extends Fn {
  return: this["args"] extends [
    infer Str extends string,
    infer From extends string | RegExpStruct<string, any>,
    ...any
  ]
    ? Str extends Str
      ? keyof RegExpStruct<string> extends keyof From
        ? ReplaceWithRegExp<
            Str,
            Exclude<From, string>["parsedMatchers"],
            To,
            Exclude<From, string>["flags"]
          >
        : Replace<Str, Extract<From, string>, To>
      : never
    : never;
}
