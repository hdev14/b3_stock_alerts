import { NextFunction, Request, Response } from 'express';

export default function checkAuthToken(request: Request, response: Response, next: NextFunction) {
  if (request.headers.cookie) {
    const cookies = request.headers.cookie.split(';');
    const auth_cookie = cookies.find((cookie) => cookie.split('=')[0] === 'AT');

    if (auth_cookie) {
      const [, token] = auth_cookie.split('=');

      if (token !== 'undefined' && token !== undefined) {
        return response.redirect('/pages/index');
      }
    }
  }

  return next();
}
