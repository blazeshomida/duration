/**
 * Describe parsing behavior for {@link Duration.parse}.
 */
export interface ParseOptions {
  /**
   * Enforce that each unit appears at most once.
   *
   * @defaultValue `true`
   */
  strict?: boolean;

  /**
   * Allow additional non-duration text in the input.
   *
   * @defaultValue `false`
   */
  allowPartial?: boolean;
}

/**
 * Describe rounding behavior for unit conversion methods.
 */
export interface ConversionOptions {
  /**
   * Set decimal places to keep during conversion.
   */
  precision?: number;

  /**
   * Set the rounding strategy.
   *
   * @defaultValue `"round"`
   */
  rounding?: RoundingMode;
}

/**
 * Define valid rounding modes for conversion methods.
 */
export type RoundingMode = "round" | "floor" | "ceil";

/**
 * Represent a time duration stored in milliseconds.
 *
 * @example
 * ```ts
 * const total = Duration.hrs(2).add(Duration.mins(30));
 * console.log(total.mins()); // 150
 * ```
 */
export class Duration {
  /**
   * Store milliseconds per second.
   */
  static readonly MS_PER_SECOND = 1000;

  /**
   * Store milliseconds per minute.
   */
  static readonly MS_PER_MINUTE = 60 * Duration.MS_PER_SECOND;

  /**
   * Store milliseconds per hour.
   */
  static readonly MS_PER_HOUR = 60 * Duration.MS_PER_MINUTE;

  /**
   * Store milliseconds per day.
   */
  static readonly MS_PER_DAY = 24 * Duration.MS_PER_HOUR;

  /**
   * Store milliseconds per week.
   */
  static readonly MS_PER_WEEK = 7 * Duration.MS_PER_DAY;

  /**
   * Store an approximate milliseconds-per-month value (30 days).
   */
  static readonly MS_PER_MONTH = 30 * Duration.MS_PER_DAY;

  /**
   * Store an approximate milliseconds-per-year value (365 days).
   */
  static readonly MS_PER_YEAR = 365 * Duration.MS_PER_DAY;

  static readonly #PARSE_REGEX = /(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w|mo|y)/gi;

  static readonly #FORMAT_UNITS = [
    { label: "y", ms: Duration.MS_PER_YEAR },
    { label: "mo", ms: Duration.MS_PER_MONTH },
    { label: "w", ms: Duration.MS_PER_WEEK },
    { label: "d", ms: Duration.MS_PER_DAY },
    { label: "h", ms: Duration.MS_PER_HOUR },
    { label: "m", ms: Duration.MS_PER_MINUTE },
    { label: "s", ms: Duration.MS_PER_SECOND },
    { label: "ms", ms: 1 },
  ] as const;

  #milliseconds: number;

  /**
   * Create a duration from milliseconds.
   */
  constructor(milliseconds = 0) {
    this.#milliseconds = milliseconds;
  }

  /**
   * Create a duration from milliseconds.
   */
  static ms(milliseconds: number): Duration {
    return new Duration(milliseconds);
  }

  /**
   * Create a duration from seconds.
   */
  static secs(seconds: number): Duration {
    return new Duration(seconds * Duration.MS_PER_SECOND);
  }

  /**
   * Create a duration from minutes.
   */
  static mins(minutes: number): Duration {
    return new Duration(minutes * Duration.MS_PER_MINUTE);
  }

  /**
   * Create a duration from hours.
   */
  static hrs(hours: number): Duration {
    return new Duration(hours * Duration.MS_PER_HOUR);
  }

  /**
   * Create a duration from days.
   */
  static days(days: number): Duration {
    return new Duration(days * Duration.MS_PER_DAY);
  }

  /**
   * Create a duration from weeks.
   */
  static weeks(weeks: number): Duration {
    return new Duration(weeks * Duration.MS_PER_WEEK);
  }

  /**
   * Create a duration from months (30-day approximation).
   */
  static months(months: number): Duration {
    return new Duration(months * Duration.MS_PER_MONTH);
  }

  /**
   * Create a duration from years (365-day approximation).
   */
  static years(years: number): Duration {
    return new Duration(years * Duration.MS_PER_YEAR);
  }

  /**
   * Parse a duration string and return a duration instance.
   *
   * @throws {Error} When input is empty, invalid, partially invalid, or has duplicate units in strict mode.
   *
   * @example
   * ```ts
   * const parsed = Duration.parse("1h 30m");
   * console.log(parsed.mins()); // 90
   * ```
   */
  static parse(input: string, options: ParseOptions = {}): Duration {
    const { strict = true, allowPartial = false } = options;
    const normalized = input.trim();

    if (normalized.length === 0) {
      throw new Error("Duration string cannot be empty");
    }

    Duration.#PARSE_REGEX.lastIndex = 0;

    const seenUnits = new Set<string>();
    let matched = false;
    let totalMilliseconds = 0;

    const remainder = input.replace(
      Duration.#PARSE_REGEX,
      (_fullMatch, rawValue: string, rawUnit: string) => {
        matched = true;
        const value = Number.parseFloat(rawValue);
        const unit = rawUnit.toLowerCase();

        if (strict && seenUnits.has(unit)) {
          throw new Error(
            `Duplicate time unit detected in strict mode: ${unit}`,
          );
        }

        seenUnits.add(unit);
        totalMilliseconds += value * Duration.#unitToMilliseconds(unit);
        return " ";
      },
    );

    if (!matched) {
      throw new Error("Invalid duration string: no duration tokens found");
    }

    if (!allowPartial && remainder.trim().length > 0) {
      throw new Error(
        `Invalid duration string: unexpected token sequence "${remainder.trim()}"`,
      );
    }

    return new Duration(totalMilliseconds);
  }

  /**
   * Return the duration value in milliseconds.
   */
  ms(): number {
    return this.#milliseconds;
  }

  /**
   * Return the duration value in seconds.
   */
  secs(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_SECOND, options);
  }

  /**
   * Return the duration value in minutes.
   */
  mins(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_MINUTE, options);
  }

  /**
   * Return the duration value in hours.
   */
  hrs(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_HOUR, options);
  }

  /**
   * Return the duration value in days.
   */
  days(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_DAY, options);
  }

  /**
   * Return the duration value in weeks.
   */
  weeks(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_WEEK, options);
  }

  /**
   * Return the duration value in months (30-day approximation).
   */
  months(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_MONTH, options);
  }

  /**
   * Return the duration value in years (365-day approximation).
   */
  years(options?: ConversionOptions): number {
    return this.#convert(Duration.MS_PER_YEAR, options);
  }

  /**
   * Return a new duration that adds another duration value.
   */
  add(other: Duration): Duration {
    return new Duration(this.#milliseconds + other.ms());
  }

  /**
   * Return a new duration that subtracts another duration value.
   */
  sub(other: Duration): Duration {
    return new Duration(this.#milliseconds - other.ms());
  }

  /**
   * Return a new duration scaled by a factor.
   */
  mul(factor: number): Duration {
    return new Duration(this.#milliseconds * factor);
  }

  /**
   * Return a new duration divided by a divisor.
   *
   * @throws {Error} When divisor is zero.
   */
  div(divisor: number): Duration {
    if (divisor === 0) {
      throw new Error("Cannot divide by zero");
    }
    return new Duration(this.#milliseconds / divisor);
  }

  /**
   * Return `true` when values are equal.
   */
  eq(other: Duration): boolean {
    return this.#milliseconds === other.ms();
  }

  /**
   * Return `true` when this value is smaller than the other value.
   */
  lt(other: Duration): boolean {
    return this.#milliseconds < other.ms();
  }

  /**
   * Return `true` when this value is larger than the other value.
   */
  gt(other: Duration): boolean {
    return this.#milliseconds > other.ms();
  }

  /**
   * Return `true` when this value is less than or equal to the other value.
   */
  lte(other: Duration): boolean {
    return this.#milliseconds <= other.ms();
  }

  /**
   * Return `true` when this value is greater than or equal to the other value.
   */
  gte(other: Duration): boolean {
    return this.#milliseconds >= other.ms();
  }

  /**
   * Return `true` when the value is exactly zero.
   */
  isZero(): boolean {
    return this.#milliseconds === 0;
  }

  /**
   * Return a new duration with absolute value.
   */
  abs(): Duration {
    return new Duration(Math.abs(this.#milliseconds));
  }

  /**
   * Format the duration as a compact, human-readable string.
   *
   * @example
   * ```ts
   * Duration.hrs(1).add(Duration.mins(5)).format(); // "1h 5m"
   * ```
   */
  format(): string {
    if (this.#milliseconds === 0) {
      return "0ms";
    }

    const sign = this.#milliseconds < 0 ? "-" : "";
    let remaining = Math.abs(this.#milliseconds);
    const parts: string[] = [];

    for (const unit of Duration.#FORMAT_UNITS) {
      if (unit.label === "ms") {
        if (remaining > 0) {
          parts.push(`${Duration.#formatNumber(remaining)}ms`);
        }
        break;
      }

      const value = Math.floor(remaining / unit.ms);
      if (value > 0) {
        parts.push(`${value}${unit.label}`);
        remaining -= value * unit.ms;
      }
    }

    return `${sign}${parts.join(" ")}`;
  }

  static #unitToMilliseconds(unit: string): number {
    switch (unit) {
      case "ms":
        return 1;
      case "s":
        return Duration.MS_PER_SECOND;
      case "m":
        return Duration.MS_PER_MINUTE;
      case "h":
        return Duration.MS_PER_HOUR;
      case "d":
        return Duration.MS_PER_DAY;
      case "w":
        return Duration.MS_PER_WEEK;
      case "mo":
        return Duration.MS_PER_MONTH;
      case "y":
        return Duration.MS_PER_YEAR;
      default:
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
  }

  #convert(unitValue: number, options?: ConversionOptions): number {
    return this.#round(this.#milliseconds / unitValue, options);
  }

  #round(value: number, options: ConversionOptions = {}): number {
    const { precision, rounding = "round" } = options;

    if (precision === undefined) {
      return value;
    }

    const factor = 10 ** precision;
    switch (rounding) {
      case "floor":
        return Math.floor(value * factor) / factor;
      case "ceil":
        return Math.ceil(value * factor) / factor;
      case "round":
      default:
        return Math.round(value * factor) / factor;
    }
  }

  static #formatNumber(value: number): string {
    if (Number.isInteger(value)) {
      return String(value);
    }
    return String(Number(value.toFixed(6)));
  }
}
