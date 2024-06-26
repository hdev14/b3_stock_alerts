import isPage from '@app/page_utils';
import {
  NextFunction, Request, Response,
} from 'express';
import { auth_service } from 'src/bootstrap';

export default function auth(request: Request, response: Response, next: NextFunction) {
  if (request.headers.cookie) {
    const cookie = request.headers.cookie.split(';').find((cookie) => cookie.split('=')[0] === 'AT');
    const [, access_token] = cookie !== undefined ? cookie.split('=') : [];

    const [, data] = auth_service.verifyAuthentication(access_token);

    if (data) {
      Object.assign(request.headers, { user_id: data.id });
      return next();
    }
  }

  return isPage(request.originalUrl)
    ? response.redirect('/pages/login')
    : response.status(401).json({ message: 'É necessário está autenticado.' });
}
