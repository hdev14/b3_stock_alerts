import validator from '@app/middlewares/validator';
import {
  NextFunction, Request, Response, Router,
} from 'express';
import { body } from 'express-validator';
import { authenticator } from 'src/bootstrap';

// TODO
const router = Router();

router.get(
  '/auth/login',
  async (request: Request, response: Response, next: NextFunction) => {
    console.log(request.headers['x-forwarded-for'], request.socket.remoteAddress);
    try {
      return response.status(204).json();
    } catch (e) {
      return next(e);
    }
  },
);

router.post(
  '/auth/reset-password',
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      return response.status(204).json();
    } catch (e) {
      return next(e);
    }
  },
);

router.post(
  '/auth/captcha',
  body('token').isString(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { token } = request.body;
      const remote_address = request.socket.remoteAddress ? request.socket.remoteAddress.split(':') : [];
      const user_id = remote_address[remote_address.length - 1];

      if (process.env.NODE_ENV === 'e2e_test') { // for e2e tests
        return response.sendStatus(204);
      }

      const result = await authenticator.verifyCaptcha(user_id, token);

      if (!result) {
        return response.status(403).json({ message: 'captcha failed' });
      }

      return response.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  },
);

export default router;
