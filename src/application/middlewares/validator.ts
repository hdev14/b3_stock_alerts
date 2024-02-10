import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export default function validator(request: Request, response: Response, next: NextFunction) {
  const result = validationResult(request);

  if (!result.isEmpty()) {
    return response.status(400).json({ errors: result.array() });
  }

  return next();
}
