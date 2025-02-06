import { _, $, Strings } from "../src/index";
import { Compose } from "../src/internals/core/Core";
import { Equal, Expect } from "../src/internals/helpers";

describe("Strings", () => {
  it("Length", () => {
    type res1 = $<Strings.Length, "">;
    //    ^?
    type test1 = Expect<Equal<res1, 0>>;
    type res2 = $<Strings.Length, "123">;
    //    ^?
    type test2 = Expect<Equal<res2, 3>>;
    type res3 = $<
      //  ^?
      Compose<[Strings.Length, Strings.Repeat<1001>]>,
      "a"
    >;
    type test3 = Expect<Equal<res3, 1001>>;
  });

  it("TrimLeft", () => {
    type res1 = $<Strings.TrimLeft, "  abc  ">;
    //    ^?
    type test1 = Expect<Equal<res1, "abc  ">>;
    type res2 = $<Strings.TrimLeft<"0">, "0001000">;
    //    ^?
    type test2 = Expect<Equal<res2, "1000">>;
  });

  it("TrimRight", () => {
    type res1 = $<Strings.TrimRight, "  abc  ">;
    //    ^?
    type test1 = Expect<Equal<res1, "  abc">>;
    type res2 = $<Strings.TrimRight<"0">, "0001000">;
    //    ^?
    type test2 = Expect<Equal<res2, "0001">>;
  });

  it("Trim", () => {
    type res1 = $<Strings.Trim, "  abc  ">;
    //    ^?
    type test1 = Expect<Equal<res1, "abc">>;
    type res2 = $<Strings.Trim<"0">, "0001000">;
    //    ^?
    type test2 = Expect<Equal<res2, "1">>;
  });

  describe("RegExp", () => {
    it("with valid RegExp Pattern return a object with `pattern`, `flags` and `parsedMatchers` props", () => {
      type res1 = Omit<
        Strings.RegExp<"(?:\\w{2,3})(?<g1>[a-z]+)\\k<g1>", "g" | "i">,
        "type"
      >;
      //    ^?
      type test1 = Expect<
        Equal<
          res1,
          {
            pattern: "(?:\\w{2,3})(?<g1>[a-z]+)\\k<g1>";
            flags: "g" | "i";
            parsedMatchers: [
              {
                type: "repeat";
                greedy: true;
                from: "2";
                to: "3";
                value: [
                  {
                    type: "char";
                  }
                ];
              },
              {
                type: "namedCapture";
                name: "g1";
                value: [
                  {
                    type: "oneOrMore";
                    greedy: true;
                    value: [
                      {
                        type: "charSet";
                        value: "a-z";
                      }
                    ];
                  }
                ];
              },
              {
                type: "backreference";
                value: "g1";
              }
            ];
          }
        >
      >;
    });

    it("return `SyntaxError` with error message when RegExp pattern is invalid", () => {
      type res1 = Strings.RegExp<"foo(b(ar)baz">;
      //    ^?

      type test1 = Expect<
        Equal<
          res1,
          {
            type: "RegExpSyntaxError";
            message: "Invalid regular expression, missing closing `)`";
          } & SyntaxError
        >
      >;

      type res2 = $<
        //    ^?
        Strings.Match<
          //@ts-expect-error - { message: "Invalid regular expression, opening `(`"; type: "RegExpSyntaxError"; } & SyntaxError
          Strings.RegExp<"foobar)baz">
        >,
        "foobarbaz"
      >;

      type res3 = Strings.RegExp<"foo[a-zbar", "g">;
      //    ^?
      type test3 = Expect<
        Equal<
          res3,
          {
            type: "RegExpSyntaxError";
            message: "Invalid regular expression, missing closing `]`";
          } & SyntaxError
        >
      >;
      type res4 = Strings.RegExp<"foo?{2}bar", "g">;
      //    ^?
      type test4 = Expect<
        Equal<
          res4,
          {
            type: "RegExpSyntaxError";
            message: "Invalid regular expression, the preceding token to {2} is not quantifiable";
          } & SyntaxError
        >
      >;
      type res5 = Strings.RegExp<"foo(?g1>bar)baz">;
      //    ^?
      type test5 = Expect<
        Equal<
          res5,
          {
            type: "RegExpSyntaxError";
            message: "Invalid regular expression, invalid capture group name for capturing `bar`, possibly due to a missing opening '<' and group name";
          } & SyntaxError
        >
      >;
      type res6 = Strings.RegExp<"foo(?<g1bar)baz", "g">;
      //    ^?
      type test6 = Expect<
        Equal<
          res6,
          {
            type: "RegExpSyntaxError";
            message: "Invalid regular expression, invalid capture group name of `g1bar`, possibly due to a missing closing '>' for group name";
          } & SyntaxError
        >
      >;
    });
  });

  describe("Match", () => {
    it("support most basic RegExp tokens", () => {
      type res1 = $<
        //    ^?
        Strings.Match<
          Strings.RegExp<"a(?<g1>[b-e$]{1,4})\\W\\s\\b\\k<g1>(\\d+)">
        >,
        "12ab$c- b$c56#"
      >;
      type test1 = Expect<
        Equal<
          res1,
          ["ab$c- b$c56", "b$c", "56"] & {
            index: 2;
            groups: {
              g1: "b$c";
            };
          }
        >
      >;

      type res2 = $<
        //    ^?
        Strings.Match<
          Strings.RegExp<"a(?<g1>\\w*)(?<g2>\\d+)(?<g3>\\w*)(?<g4>\\w+)">
        >,
        "abcd1234xyz"
      >;
      type test2 = Expect<
        Equal<
          res2,
          ["abcd1234xyz", "bcd123", "4", "xy", "z"] & {
            index: 0;
            groups: {
              g1: "bcd123";
              g2: "4";
              g3: "xy";
              g4: "z";
            };
          }
        >
      >;
    });

    it("support RegExp global `g` flag", () => {
      type res3 = $<
        //    ^?
        Strings.Match<Strings.RegExp<"c\\w{2,6}", "g">>,
        "cats and cows ride in a car with cozy couch that's made for comfort."
      >;
      type test3 = Expect<
        Equal<res3, ["cats", "cows", "car", "cozy", "couch", "comfort"]>
      >;
    });

    it("support RegExp case case insensitive `i` flag", () => {
      type res4 = $<
        //    ^?
        Strings.Match<Strings.RegExp<"C[a-z]+", "g" | "i">>,
        "Cats and coWs ride in a CAR with cozY cOUch that's made for Comfort."
      >;
      type test4 = Expect<
        Equal<res4, ["Cats", "coWs", "CAR", "cozY", "cOUch", "Comfort"]>
      >;
    });
  });

  describe("MatchAll", () => {
    it("support most basic RegExp tokens", () => {
      type res1 = $<
        //   ^?
        Strings.MatchAll<Strings.RegExp<"c(?<letters>[a-z]+)", "g">>,
        "my cats love to play with toy car under the couch."
      >;
      type test1 = Expect<
        Equal<
          res1,
          [
            ["cats", "ats"] & {
              index: 3;
              groups: {
                letters: "ats";
              };
            },
            ["car", "ar"] & {
              index: 30;
              groups: {
                letters: "ar";
              };
            },
            ["couch", "ouch"] & {
              index: 44;
              groups: {
                letters: "ouch";
              };
            }
          ]
        >
      >;
    });

    it("return `null` if no match", () => {
      type res2 = $<
        //   ^?
        Strings.MatchAll<Strings.RegExp<"z(?<letters>[a-z]+)", "g">>,
        "my cats love to play with toy car under the couch."
      >;

      type test2 = Expect<Equal<res2, null>>;
    });

    it("require global `g`", () => {
      type res3 = $<
        //   ^?
        Strings.MatchAll<Strings.RegExp<"c(?<letters>[a-z]+)">>,
        "my cats love to play with toy car under the couch."
      >;

      type test3 = Expect<
        Equal<
          res3,
          TypeError & {
            msg: "MatchAll called with a non-global RegExp argument";
          }
        >
      >;
    });

    it("support RegExp case insensitive `i` flag", () => {
      type res4 = $<
        //    ^?
        Strings.MatchAll<Strings.RegExp<"c(?<letters>[a-z]+)", "g" | "i">>,
        "my Cats love to play with toy CAR under the cOucH."
      >;
      type test4 = Expect<
        Equal<
          res4,
          [
            ["Cats", "ats"] & {
              index: 3;
              groups: {
                letters: "ats";
              };
            },
            ["CAR", "AR"] & {
              index: 30;
              groups: {
                letters: "AR";
              };
            },
            ["cOucH", "OucH"] & {
              index: 44;
              groups: {
                letters: "OucH";
              };
            }
          ]
        >
      >;
    });
  });

  describe("Replace", () => {
    it("replaces single letters", () => {
      type res1 = $<Strings.Replace<"a", "b">, "abc">;
      //    ^?
      type test1 = Expect<Equal<res1, "bbc">>;
    });

    it("is identity on empty strings", () => {
      type res2 = $<Strings.Replace<"a", "b">, "">;
      //    ^?
      type test2 = Expect<Equal<res2, "">>;
    });

    it("replacing by empty string", () => {
      type res3 = $<Strings.Replace<"a", "">, "abc">;
      //    ^?
      type test3 = Expect<Equal<res3, "bc">>;
    });

    it("supports multi char strings", () => {
      type res4 = $<Strings.Replace<"hello", "hi!">, "hello world!">;
      //    ^?
      type test4 = Expect<Equal<res4, "hi! world!">>;

      type res5 = $<Strings.Replace<"many", "more">, "many more than many">;
      //    ^?
      type test5 = Expect<Equal<res5, "more more than more">>;
    });

    it("supports union types", () => {
      type res6 = $<Strings.Replace<"a" | "b", "c">, "abc">;
      //    ^?
      type test6 = Expect<Equal<res6, "ccc">>;

      type res4 = $<
        //    ^?
        Strings.Replace<"hello" | "hi", "sup">,
        "hello world! hi!"
      >;
      type test4 = Expect<Equal<res4, "sup world! sup!">>;
    });

    it("support using RegExp pattern", () => {
      type res8 = $<
        //    ^?
        Strings.Replace<
          Strings.RegExp<"((?:\\w|\\s)+):\\s(?<year>\\d{4})/(?<month>\\d{1,2})/(?<day>\\d{1,2})">,
          "The $1 is $<month>.$<day>, $2"
        >,
        "release day: 2023/2/13"
      >;
      type test8 = Expect<Equal<res8, "The release day is 2.13, 2023">>;
    });

    it("support using union of RegExp pattern", () => {
      type res9 = $<
        //    ^?
        Strings.Replace<
          | Strings.RegExp<"42\\d{2}(?:-\\d{4}){3}">
          | Strings.RegExp<"token-[a-zA-Z0-9_]+">,
          "<masked>"
        >,
        "credit card number: 4232-3242-5823-8421, myToken: token-shekh23xz2jd_32jd213"
      >;
      type test9 = Expect<
        Equal<res9, "credit card number: <masked>, myToken: <masked>">
      >;
    });

    it("support using RegExp pattern with flags", () => {
      type res10 = $<
        //    ^?
        Strings.Replace<
          Strings.RegExp<
            '(<(?:\\/)?)(?<tag>[a-z]{2,16})((?:\\s(?:\\w|=|\\")+)?>)',
            "g" | "i"
          >,
          "$1My$<tag>$3"
        >,
        '<Card class="bg-primary"><Title>HotScript X type-level RegExp!</Title><CardContent><p>Type level madness.</p><ActionBtn>READ MORE</ActionBtn></CardContent></Card>'
      >;
      type test10 = Expect<
        Equal<
          res10,
          '<Card class="bg-primary"><MyTitle>HotScript X type-level RegExp!</MyTitle><MyCardContent><p>Type level madness.</p><MyActionBtn>READ MORE</MyActionBtn></MyCardContent></MyCard>'
        >
      >;
    });
  });

  it("Slice", () => {
    type res1 = $<Strings.Slice<1, 3>, "123">;
    //    ^?
    type test1 = Expect<Equal<res1, "23">>;
    type res2 = $<Strings.Slice<0, 3>, "123">;
    //    ^?
    type test2 = Expect<Equal<res2, "123">>;
    type res3 = $<Strings.Slice<1, 4>, "123">;
    //    ^?
    type test3 = Expect<Equal<res3, "23">>;
    type res4 = $<Strings.Slice<1, 1>, "123">;
    //    ^?
    type test4 = Expect<Equal<res4, "">>;
  });

  it("Split", () => {
    type res1 = $<Strings.Split<".">, "1.2.3">;
    //    ^?
    type test1 = Expect<Equal<res1, ["1", "2", "3"]>>;
    type res2 = $<Strings.Split<"">, "123">;
    //    ^?
    type test2 = Expect<Equal<res2, ["1", "2", "3"]>>;
    type res3 = $<Strings.Split<"">, "">;
    //    ^?
    type test3 = Expect<Equal<res3, []>>;
    type res4 = $<Strings.Split<"--" | ".">, "1--2-3.4..5">;
    //    ^?
    type test4 = Expect<Equal<res4, ["1", "2-3", "4", "5"]>>;

    type res5 = $<Strings.Split<Strings.RegExp<"-{2,4}|\\.">>, "1--2-3.4..5">;
    //    ^?
    type test5 = Expect<Equal<res5, ["1", "2-3", "4", "5"]>>;

    type res6 = $<
      //    ^?
      Strings.Split<Strings.RegExp<"{|}"> | Strings.RegExp<"[*-.:]">>,
      "{name:'foo',age:18}"
    >;
    type test6 = Expect<Equal<res6, ["name", "'foo'", "age", "18"]>>;
  });

  it("Repeat", () => {
    type res1 = $<Strings.Repeat<3>, "a">;
    //    ^?
    type test1 = Expect<Equal<res1, "aaa">>;
    type res2 = $<Strings.Repeat<0>, "a">;
    //    ^?
    type test2 = Expect<Equal<res2, "">>;
    type res3 = $<Strings.Repeat<1>, "a">;
    //    ^?
    type test3 = Expect<Equal<res3, "a">>;
    type res4 = $<Strings.Repeat<2>, "hello!">;
    //    ^?
    type test4 = Expect<Equal<res4, "hello!hello!">>;
  });

  it("StartsWith", () => {
    type res1 = $<Strings.StartsWith<"hello">, "hello world">;
    //    ^?
    type test1 = Expect<Equal<res1, true>>;
    type res2 = $<Strings.StartsWith<"hello">, "world hello">;
    //    ^?
    type test2 = Expect<Equal<res2, false>>;
    type res3 = $<Strings.StartsWith<"">, "hello world">;
    //    ^?
    type test3 = Expect<Equal<res3, true>>;
    type res4 = $<Strings.StartsWith<"">, "">;
    //    ^?
    type test4 = Expect<Equal<res4, true>>;
  });

  it("EndsWith", () => {
    type res1 = $<Strings.EndsWith<"world">, "hello world">;
    //    ^?
    type test1 = Expect<Equal<res1, true>>;
    type res2 = $<Strings.EndsWith<"world">, "world hello">;
    //    ^?
    type test2 = Expect<Equal<res2, false>>;
    type res3 = $<Strings.EndsWith<"">, "hello world">;
    //    ^?
    type test3 = Expect<Equal<res3, true>>;
    type res4 = $<Strings.EndsWith<"">, "">;
    //    ^?
    type test4 = Expect<Equal<res4, true>>;
  });

  it("ToTuple", () => {
    type res1 = $<Strings.ToTuple, "abc">;
    //    ^?
    type test1 = Expect<Equal<res1, ["a", "b", "c"]>>;
    type res2 = $<Strings.ToTuple, "">;
    //    ^?
    type test2 = Expect<Equal<res2, []>>;
  });

  it("ToNumber", () => {
    type res1 = $<Strings.ToNumber, "11">;
    //    ^?
    type test1 = Expect<Equal<res1, 11>>;
  });

  it("ToString", () => {
    type res1 = $<Strings.ToString, 11>;
    //    ^?
    type test1 = Expect<Equal<res1, "11">>;
  });

  it("Prepend", () => {
    type res1 = $<Strings.Prepend<"1 ">, "abc">;
    //    ^?
    type test1 = Expect<Equal<res1, "1 abc">>;
  });

  it("Append", () => {
    type res1 = $<Strings.Append<" 1">, "abc">;
    //    ^?
    type test1 = Expect<Equal<res1, "abc 1">>;
  });

  it("Uppercase", () => {
    type res1 = $<Strings.Uppercase, "abc">;
    //    ^?
    type test1 = Expect<Equal<res1, "ABC">>;
  });

  it("Lowercase", () => {
    type res1 = $<Strings.Lowercase, "ABC">;
    //    ^?
    type test1 = Expect<Equal<res1, "abc">>;
  });

  it("Capitalize", () => {
    type res1 = $<Strings.Capitalize, "abc">;
    //    ^?
    type test1 = Expect<Equal<res1, "Abc">>;
  });

  it("Uncapitalize", () => {
    type res1 = $<Strings.Uncapitalize, "ABC">;
    //    ^?
    type test1 = Expect<Equal<res1, "aBC">>;
  });

  it("SnakeCase", () => {
    type res1 = $<Strings.SnakeCase, "helloWorldYo">;
    //    ^?
    type test1 = Expect<Equal<res1, "hello_world_yo">>;
    type res2 = $<Strings.SnakeCase, "HelloWorldYo">;
    //    ^?
    type test2 = Expect<Equal<res2, "hello_world_yo">>;
  });

  it("KebabCase", () => {
    type res1 = $<Strings.KebabCase, "helloWorldYo">;
    //    ^?
    type test1 = Expect<Equal<res1, "hello-world-yo">>;
    type res2 = $<Strings.KebabCase, "HelloWorldYo">;
    //    ^?
    type test2 = Expect<Equal<res2, "hello-world-yo">>;
  });

  it("CamelCase", () => {
    type res1 = $<Strings.CamelCase, "hello_world_yo">;
    //    ^?
    type test1 = Expect<Equal<res1, "helloWorldYo">>;
  });

  it("Compare", () => {
    type res1 = $<Strings.Compare<"a">, "a">;
    //    ^?
    type test1 = Expect<Equal<res1, 0>>;
    type res2 = $<Strings.Compare<"a">, "b">;
    //    ^?
    type test2 = Expect<Equal<res2, 1>>;
    type res3 = $<Strings.Compare<"a", _>, "b">;
    //    ^?
    type test3 = Expect<Equal<res3, -1>>;
    type res4 = $<Strings.Compare<"b">, "a">;
    //    ^?
    type test4 = Expect<Equal<res4, -1>>;
    type res5 = $<Strings.Compare, "ab", "b">;
    //    ^?
    type test5 = Expect<Equal<res5, -1>>;
    type res6 = $<Strings.Compare, "b", "ab">;
    //    ^?
    type test6 = Expect<Equal<res6, 1>>;
    type res7 = $<Strings.Compare, "ab", "ab">;
    //    ^?
    type test7 = Expect<Equal<res7, 0>>;
    type res8 = $<Strings.Compare, "ab", "ac">;
    //    ^?
    type test8 = Expect<Equal<res8, -1>>;
  });

  it("LessThan", () => {
    type res1 = $<Strings.LessThan<"a">, "b">;
    //    ^?
    type test1 = Expect<Equal<res1, false>>;
    type res2 = $<Strings.LessThan<"b">, "a">;
    //    ^?
    type test2 = Expect<Equal<res2, true>>;
    type res3 = $<Strings.LessThan<"a">, "a">;
    //    ^?
    type test3 = Expect<Equal<res3, false>>;
    type res4 = $<Strings.LessThan, "a", "aa">;
    //    ^?
    type test4 = Expect<Equal<res4, true>>;
  });

  it("LessThanOrEqual", () => {
    type res1 = $<Strings.LessThanOrEqual<"a">, "b">;
    //    ^?
    type test1 = Expect<Equal<res1, false>>;
    type res2 = $<Strings.LessThanOrEqual<"b">, "a">;
    //    ^?
    type test2 = Expect<Equal<res2, true>>;
    type res3 = $<Strings.LessThanOrEqual<"a">, "a">;
    //    ^?
    type test3 = Expect<Equal<res3, true>>;
    type res4 = $<Strings.LessThanOrEqual, "a", "aa">;
    //    ^?
    type test4 = Expect<Equal<res4, true>>;
  });

  it("GreaterThan", () => {
    type res1 = $<Strings.GreaterThan<"a">, "b">;
    //    ^?
    type test1 = Expect<Equal<res1, true>>;
    type res2 = $<Strings.GreaterThan<"b">, "a">;
    //    ^?
    type test2 = Expect<Equal<res2, false>>;
    type res3 = $<Strings.GreaterThan<"a">, "a">;
    //    ^?
    type test3 = Expect<Equal<res3, false>>;
    type res4 = $<Strings.GreaterThan, "a", "aa">;
    //    ^?
    type test4 = Expect<Equal<res4, false>>;
  });

  it("GreaterThanOrEqual", () => {
    type res1 = $<Strings.GreaterThanOrEqual<"a">, "b">;
    //    ^?
    type test1 = Expect<Equal<res1, true>>;
    type res2 = $<Strings.GreaterThanOrEqual<"b">, "a">;
    //    ^?
    type test2 = Expect<Equal<res2, false>>;
    type res3 = $<Strings.GreaterThanOrEqual<"a">, "a">;
    //    ^?
    type test3 = Expect<Equal<res3, true>>;
    type res4 = $<Strings.GreaterThanOrEqual, "a", "aa">;
    //    ^?
    type test4 = Expect<Equal<res4, false>>;
  });
});
