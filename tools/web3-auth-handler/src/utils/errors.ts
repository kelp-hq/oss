/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export class StrategyValidationError extends Error {
  /**
   * HTTP status code
   */
  status: number;

  constructor(message: string, status: number) {
    super(message);
    // Set the name
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
