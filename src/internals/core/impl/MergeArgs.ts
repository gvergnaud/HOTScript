import { unset, _ } from "../../core/Core";
import { Equal, IsNever } from "../../helpers";

export type ExcludePlaceholders<xs, output extends any[] = []> = xs extends [
  infer first,
  ...infer rest
]
  ? Equal<first, _> extends true
    ? ExcludePlaceholders<rest, output>
    : ExcludePlaceholders<rest, [...output, first]>
  : output;

export type ExcludeUnset<xs, output extends any[] = []> = xs extends [
  infer first,
  ...infer rest
]
  ? first extends unset
    ? ExcludeUnset<rest, output>
    : ExcludeUnset<rest, [...output, first]>
  : output;

type MergeArgsRec<
  pipedArgs extends any[],
  partialArgs extends any[],
  output extends any[] = []
> = partialArgs extends [infer partialFirst, ...infer partialRest]
  ? IsNever<partialFirst> extends true
    ? MergeArgsRec<pipedArgs, partialRest, [...output, partialFirst]>
    : [partialFirst] extends [_]
    ? pipedArgs extends [infer pipedFirst, ...infer pipedRest]
      ? MergeArgsRec<pipedRest, partialRest, [...output, pipedFirst]>
      : [...output, ...ExcludePlaceholders<partialRest>]
    : MergeArgsRec<pipedArgs, partialRest, [...output, partialFirst]>
  : [...output, ...pipedArgs];

type EmptyIntoPlaceholder<x> = IsNever<x> extends true
  ? never
  : [x] extends [unset]
  ? _
  : x;

type MapEmptyIntoPlaceholder<xs, output extends any[] = []> = xs extends [
  infer first,
  ...infer rest
]
  ? MapEmptyIntoPlaceholder<rest, [...output, EmptyIntoPlaceholder<first>]>
  : output;

export type MergeArgs<
  pipedArgs extends any[],
  partialArgs extends any[]
> = MergeArgsRec<pipedArgs, MapEmptyIntoPlaceholder<partialArgs>>;
