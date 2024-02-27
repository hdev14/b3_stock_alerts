import CredentialError from '@shared/CredentialError';
import EmailAlreadyRegisteredError from '@shared/EmailAlreadyRegisteredError';
import ExpiredCodeError from '@shared/ExpiredCodeError';
import NotFoundError from '@shared/NotFoundError';
import {
  NextFunction, Request, Response, Router,
} from 'express';
import { auth_service, user_service } from 'src/bootstrap';

const router = Router();

router.post('/login', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    const [error, data] = await auth_service.login(email, password);
    const isProd = process.env.NODE_ENV === 'production';

    if (data) {
      response.cookie('AT', data.token, {
        httpOnly: isProd,
        sameSite: isProd,
        secure: true,
        domain: isProd ? process.env.SERVER_DOMAIN : '',
        expires: data.expired_at,
      });

      return response.redirect('/');
    }

    if (error instanceof CredentialError) {
      return response.redirect(`/pages/login?error_message=${error.message}`);
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

    const [error, data] = await user_service.createUser({
      email,
      name,
      password,
      phone_number,
    });

    if (error instanceof EmailAlreadyRegisteredError) {
      return response.redirect(`/pages/signup?error_message=${error.message}`);
    }

    await auth_service.sendConfirmationCode(data!.email);

    return response.redirect(`/pages/confirm-code?email=${data!.email}`);
  } catch (e) {
    return next(e);
  }
});

router.post('/confirm-code', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, code } = request.body;

    const [error, data] = await auth_service.confirmCode(email, code);

    const query_params = new URLSearchParams({ email });

    if (error instanceof ExpiredCodeError) {
      query_params.append('error_message', error.message);
      return response.redirect(`/pages/confirm-code?${query_params.toString()}`);
    }

    if (!data) {
      query_params.append('error_message', 'Código não encontrado.');
      return response.redirect(`/pages/confirm-code?${query_params.toString()}`);
    }

    return response.redirect('/pages/login');
  } catch (e) {
    return next(e);
  }
});

router.post('/forgot-password', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = request.body;

    const [error] = await auth_service.forgotPassword(email)

    const query_params = new URLSearchParams();

    if (error instanceof NotFoundError) {
      query_params.append('error_message', 'Não foi encontrado nenhum usuário com esse endereço de e-mail.');
    } else {
      query_params.append('info_message', 'Por favor verifique seu e-mail. Caso não tenha recebido tente novamente.');
    }

    return response.redirect(`/pages/forgot-password?${query_params.toString()}`);
  } catch (e) {
    return next(e);
  }
});

export default router;
