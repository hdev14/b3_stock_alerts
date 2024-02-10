import { Request, Response, Router } from 'express';
import { auth_service } from 'src/bootstrap';

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

  return response.render('/pages/login');
});

router.post('/register', (request: Request, response: Response) => {
  console.log(request.body);
  response.redirect('/');
});

router.post('/forgot-password', (request: Request, response: Response) => {
  console.log(request.body);
  response.redirect('/');
});

export default router;