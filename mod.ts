/**
 * Provide utilities for representing, parsing, and converting time durations.
 *
 * @module duration
 *
 * @example
 * ```ts
 * import { Duration } from "jsr:@blazes/duration";
 *
 * const value = Duration.hrs(1).add(Duration.mins(30));
 * console.log(value.mins()); // 90
 * ```
 */
export {
  type ConversionOptions,
  Duration,
  type ParseOptions,
  type RoundingMode,
} from "./duration.ts";
