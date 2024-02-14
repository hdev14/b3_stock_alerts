import CredentialError from '@shared/CredentialError';
import EmailAlreadyRegisteredError from '@shared/EmailAlreadyRegisteredError';
import ExpiredCodeError from '@shared/ExpiredCodeError';
import {
  NextFunction, Request, Response, Router,
} from 'express';
import { auth_service, user_service } from 'src/bootstrap';

const router = Router();

router.post('/login', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    const result = await auth_service.login(email, password);
    const isProd = process.env.NODE_ENV === 'production';

    if (result.data) {
      response.cookie('AT', result.data.token, {
        httpOnly: isProd,
        sameSite: isProd,
        secure: true,
        domain: isProd ? process.env.SERVER_DOMAIN : '',
        expires: result.data.expired_at,
      });

      return response.redirect('/');
    }

    if (result.error instanceof CredentialError) {
      return response.redirect(`/pages/login?error_message=${result.error.message}`);
    }

    return response.render('/pages/login');
  } catch (e) {
    return next(e)
  }
});

router.post('/logout', (_request: Request, response: Response) => {
  response.clearCookie('AT');
  response.redirect('/pages/login');
});

router.post('/signup', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const {
      email,
      name,
      password,
      phone_number,
    } = request.body;

    const result = await user_service.createUser({
      email,
      name,
      password,
      phone_number,
    });

    if (result.error instanceof EmailAlreadyRegisteredError) {
      return response.redirect(`/pages/signup?error_message=${result.error.message}`);
    }

    await auth_service.sendConfirmationCode(result.data!.email);

    return response.redirect(`/pages/confirm-code?email=${result.data!.email}`);
  } catch (e) {
    return next(e);
  }
});

router.post('/confirm-code', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, code } = request.body;

    const result = await auth_service.confirmCode(email, code);

    if (result.error instanceof ExpiredCodeError) {
      const query_params = new URLSearchParams({
        email,
        error_message: result.error.message,
      }).toString();
      return response.redirect(`/pages/confirm-code?${query_params}`);
    }

    if (!result.data) {
      const query_params = new URLSearchParams({
        email,
        error_message: 'Código não encontrado.',
      }).toString();
      return response.redirect(`/pages/confirm-code?${query_params}`);
    }

    return response.redirect('/pages/login');
  } catch (e) {
    return next(e);
  }
});

router.post('/forgot-password', (request: Request, response: Response) => {
  console.log(request.body);
  response.redirect('/');
});

export default router;
