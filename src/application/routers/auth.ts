import validator from '@app/middlewares/validator';
import NotFoundError from '@shared/NotFoundError';
import {
  NextFunction, Request, Response, Router,
} from 'express';
import { body, checkSchema, param } from 'express-validator';
import { auth_service } from 'src/bootstrap';
import { reset_password } from './validations';

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
      const user_ip = remote_address[remote_address.length - 1];

      if (process.env.NODE_ENV === 'e2e_test') { // for e2e tests
        return response.sendStatus(204);
      }

      const result = await auth_service.verifyCaptcha(user_ip, token);

      if (result.data) {
        return response.sendStatus(204);
      }

      return response.status(403).json({ message: 'captcha failed' });
    } catch (e) {
      return next(e);
    }
  },
);

router.patch(
  '/auth/passwords/:user_id',
  param('user_id').isUUID(),
  checkSchema(reset_password),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { user_id } = request.params;
      const { password } = request.body;

      const result = await auth_service.resetPassword(user_id, password);

      if (result.error && result.error instanceof NotFoundError) {
        return response.status(404).json({ message: result.error.message });
      }

      return response.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  },
);

router.post(
  '/auth/codes',
  body('email').isEmail(),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { email } = request.body;

      const result = await auth_service.sendConfirmationCode(email);

      if (result.error && result.error instanceof NotFoundError) {
        return response.status(404).json({ message: result.error.message });
      }

      return response.sendStatus(204);
    } catch (e) {
      return next(e);
    }
  },
);

export default router;
