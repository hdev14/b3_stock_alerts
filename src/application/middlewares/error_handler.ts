import isPage from '@app/page_utils';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (isPage(request.originalUrl)) {
    return response.redirect('/pages/500');
  }

  return response.status(500).json({ message: 'Internal Server Error' });
}
