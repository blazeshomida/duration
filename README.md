# duration

A TypeScript duration utility library for developers who need predictable time
creation, parsing, conversion, and arithmetic.

## Features

- Create duration values with static factories from milliseconds through years.
- Convert instance values with optional rounding and precision controls.
- Parse duration strings such as `1h 30m` with strict validation by default.
- Compose immutable arithmetic operations (`add`, `sub`, `mul`, `div`).
- Compare duration values with explicit equality and ordering methods.

## Installation

```sh
deno add jsr:@blazes/duration
```

## Quick Start

```ts
import { Duration } from "jsr:@blazes/duration";

const total = Duration.hrs(1)
  .add(Duration.mins(30))
  .add(Duration.secs(15));

console.log(total.mins()); // 90.25
console.log(total.format()); // "1h 30m 15s"
```

## Usage / API

| Area        | API                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Factories   | `Duration.ms`, `Duration.secs`, `Duration.mins`, `Duration.hrs`, `Duration.days`, `Duration.weeks`, `Duration.months`, `Duration.years` |
| Parsing     | `Duration.parse(input, { strict, allowPartial })`                                                                                       |
| Conversions | `ms`, `secs`, `mins`, `hrs`, `days`, `weeks`, `months`, `years`                                                                         |
| Arithmetic  | `add`, `sub`, `mul`, `div`                                                                                                              |
| Comparison  | `eq`, `lt`, `lte`, `gt`, `gte`                                                                                                          |
| Utilities   | `isZero`, `abs`, `format`                                                                                                               |

## Examples

```ts
import { Duration } from "jsr:@blazes/duration";

const parsed = Duration.parse("2h 45m");
console.log(parsed.mins()); // 165

const rounded = Duration.secs(1.23456).secs({
  precision: 2,
  rounding: "ceil",
});
console.log(rounded); // 1.24

const negative = Duration.mins(-90);
console.log(negative.format()); // "-1h 30m"
```

## Project Status

This project is active and targeting its initial `0.1.0` JSR release.

For release note generation, install `git-cliff` (for example:
`brew install git-cliff`) and run `deno task changelog`.

## Development

```sh
deno task verify
deno task publish:dry-run
deno task changelog:unreleased
```

## License

MIT
