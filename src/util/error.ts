/**
 * Return a plain object representation of an error for structured logging.
 * @param err The error to normalize.
 * @returns A plain object to pass to logger.
 */
export function normalizeError(err: Error) {
  return {
    errName: err.name,
    errMsg: err.message,
    errStack: err.stack,
  }
}
