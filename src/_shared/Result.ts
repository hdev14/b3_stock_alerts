type Result<T = unknown> = {
  error?: Error,
  data?: T
};

export default Result;