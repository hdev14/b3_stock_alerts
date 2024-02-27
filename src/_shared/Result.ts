/* eslint-disable no-sparse-arrays */
export type Result<T = any> = [error: Error | undefined, data: T];

export function success(data: any = {}): Result {
  return [, data];
}

export function error(error: Error): Result {
  return [error, {}];
}
