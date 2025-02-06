import { Matcher, ParseRegExp } from "type-level-regexp/regexp";

declare const RegExpSymbol: unique symbol;
type RegExpSymbol = typeof RegExpSymbol;
export type SupportedRegExpFlags = "i" | "g";

export type RegExpStruct<
  Pattern extends string,
  Flags extends SupportedRegExpFlags = never,
  ParsedMatchersOrError = string extends Pattern
    ? Matcher[]
    : ParseRegExp<Pattern>
> = ParsedMatchersOrError extends Matcher[]
  ? {
      type: RegExpSymbol;
      pattern: Pattern;
      flags: Flags;
      parsedMatchers: ParsedMatchersOrError;
    }
  : ParsedMatchersOrError;
