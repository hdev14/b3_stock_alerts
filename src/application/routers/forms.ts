import CredentialError from '@shared/CredentialError';
import EmailAlreadyRegisteredError from '@shared/EmailAlreadyRegisteredError';
import { Request, Response, Router } from 'express';
import { auth_service, user_service } from 'src/bootstrap';

const router = Router();

router.post('/login', async (request: Request, response: Response) => {
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
});

router.post('/logout', (_request: Request, response: Response) => {
  response.clearCookie('AT');
  response.redirect('/pages/login');
});

router.post('/signup', async (request: Request, response: Response) => {
  const {
    email,
    name,
    password,
    phone_number,
  } = request.body;

  console.log(request.body);

  const result = await user_service.createUser({
    email,
    name,
    password,
    phone_number,
  });

  if (result.error instanceof EmailAlreadyRegisteredError) {
    return response.redirect(`/pages/signup?error_message=${result.error.message}`);
  }

  return response.redirect('/pages/confirm-code');
});

router.post('/forgot-password', (request: Request, response: Response) => {
  console.log(request.body);
  response.redirect('/');
});

export default router;
