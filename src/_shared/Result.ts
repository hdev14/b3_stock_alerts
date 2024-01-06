type Result<T = unknown> = {
  error?: Error,
  data?: T
} | void;

export default Result;