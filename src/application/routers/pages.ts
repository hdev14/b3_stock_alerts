import auth from '@app/middlewares/auth';
import checkAuthToken from '@app/middlewares/check_auth_token';
import { Request, Response, Router } from 'express';
import { getAlerts, getScripts } from '../page_utils';

const router = Router();

router.get('/index', auth, (_request: Request, response: Response) => {
  response.render('index', { title: 'B3 Stock Alerts!' });
});

router.get('/home', (_request: Request, response: Response) => {
  response.render('home', { title: 'B3 Stock Alerts!' });
});

router.get('/login', checkAuthToken, (request: Request, response: Response) => response.render('login', {
  title: 'Login!',
  scripts: getScripts(['captcha', 'validator', 'form']),
  alerts: getAlerts(request.query),
}));

router.get('/signup', (request: Request, response: Response) => response.render('signup', {
  title: 'Sign up!',
  scripts: getScripts(['captcha', 'validator', 'form', 'imask']),
  alerts: getAlerts(request.query),
}));

router.get('/confirm-code', (request: Request, response: Response) => {
  if (!request.query.email) {
    return response.redirect('/pages/login');
  }

  return response.render('confirm_code', {
    title: 'Confirmar código!',
    email: request.query.email,
    scripts: getScripts(['validator', 'form']),
    alerts: getAlerts(request.query),
  });
});

router.get('/forgot-password', (request: Request, response: Response) => response.render('forgot_password', {
  title: 'Esqueceu a senha?',
  scripts: getScripts(['captcha', 'validator', 'form']),
  alerts: getAlerts(request.query),
}));

router.get('/reset-password', (request: Request, response: Response) => {
  if (!request.query.user_id) {
    return response.redirect('/pages/login');
  }

  return response.render('reset_password', {
    title: 'Resetar senha',
    user_id: request.query.user_id,
    scripts: getScripts(['validator', 'form']),
    alerts: getAlerts(request.query),
  });
});

router.get('/500', (_request: Request, response: Response) => response.render('500', {
  title: 'Internal Server Error!',
}));

export default router;
