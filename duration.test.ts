import { Duration } from "./mod.ts";

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(
      message ?? `Expected ${String(expected)}, got ${String(actual)}`,
    );
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(fn: () => void, expectedMessagePart: string): void {
  let didThrow = false;
  try {
    fn();
  } catch (error) {
    didThrow = true;
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes(expectedMessagePart),
      `Expected error message to contain "${expectedMessagePart}", got "${message}"`,
    );
  }

  if (!didThrow) {
    throw new Error("Expected function to throw");
  }
}

Deno.test("creates durations from static factories", () => {
  assertEqual(Duration.ms(500).ms(), 500);
  assertEqual(Duration.secs(2).ms(), 2000);
  assertEqual(Duration.mins(2).ms(), 120000);
  assertEqual(Duration.hrs(1).ms(), 3600000);
  assertEqual(Duration.days(1).ms(), 86400000);
  assertEqual(Duration.weeks(1).ms(), 604800000);
  assertEqual(Duration.months(1).ms(), 2592000000);
  assertEqual(Duration.years(1).ms(), 31536000000);
});

Deno.test("converts between units with rounding options", () => {
  assertEqual(Duration.secs(90).mins(), 1.5);
  assertEqual(Duration.mins(90).hrs(), 1.5);
  assertEqual(Duration.secs(1.23456).secs({ precision: 2 }), 1.23);
  assertEqual(
    Duration.secs(1.23456).secs({ precision: 2, rounding: "floor" }),
    1.23,
  );
  assertEqual(
    Duration.secs(1.23456).secs({ precision: 2, rounding: "ceil" }),
    1.24,
  );
});

Deno.test("parses valid duration strings", () => {
  const parsed = Duration.parse("1h 30m 15s");
  const expected = Duration.hrs(1)
    .add(Duration.mins(30))
    .add(Duration.secs(15));
  assertEqual(parsed.ms(), expected.ms());
});

Deno.test("parse strict mode rejects duplicate units", () => {
  assertThrows(
    () => Duration.parse("1d 2d"),
    "Duplicate time unit detected in strict mode",
  );
});

Deno.test("parse loose mode allows duplicate units", () => {
  const parsed = Duration.parse("1d 2d 3d", { strict: false });
  assertEqual(parsed.days(), 6);
});

Deno.test("parse rejects invalid and partial input by default", () => {
  assertThrows(() => Duration.parse(""), "cannot be empty");
  assertThrows(() => Duration.parse("abc"), "no duration tokens found");
  assertThrows(() => Duration.parse("1h foo"), "unexpected token sequence");
});

Deno.test("parse can allow partial input", () => {
  const parsed = Duration.parse("1h foo", { allowPartial: true });
  assertEqual(parsed.hrs(), 1);
});

Deno.test("supports arithmetic operations", () => {
  const a = Duration.mins(30);
  const b = Duration.mins(15);

  assertEqual(a.add(b).mins(), 45);
  assertEqual(a.sub(b).mins(), 15);
  assertEqual(b.mul(2).mins(), 30);
  assertEqual(a.div(2).mins(), 15);
  assertThrows(() => a.div(0), "Cannot divide by zero");
});

Deno.test("supports comparison methods", () => {
  const a = Duration.mins(30);
  const b = Duration.mins(15);
  const c = Duration.mins(30);

  assertEqual(a.eq(c), true);
  assertEqual(a.eq(b), false);
  assertEqual(b.lt(a), true);
  assertEqual(a.gt(b), true);
  assertEqual(a.lte(c), true);
  assertEqual(a.gte(c), true);
});

Deno.test("formats durations and handles negatives", () => {
  const positive = Duration.hrs(1)
    .add(Duration.mins(30))
    .add(Duration.secs(15));
  assertEqual(positive.format(), "1h 30m 15s");

  const negative = Duration.mins(-90);
  assertEqual(negative.format(), "-1h 30m");

  assertEqual(Duration.ms(0).format(), "0ms");
});

Deno.test("supports utility methods", () => {
  assertEqual(Duration.ms(0).isZero(), true);
  assertEqual(Duration.ms(-5000).abs().ms(), 5000);
});
