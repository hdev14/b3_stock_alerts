import { NextFunction, Request, Response } from 'express';

// TODO
export default function auth(request: Request, _response: Response, next: NextFunction) {
  console.log(request.cookies);

  next();
}
