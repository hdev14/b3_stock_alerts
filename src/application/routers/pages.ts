import auth from '@app/middlewares/auth';
import { Request, Response, Router } from 'express';
import { getAlerts, getScripts, getStyles } from '../page_utils';

const router = Router();

router.get('/index', auth, (_request: Request, response: Response) => {
  response.render('index', { title: 'B3 Stock Alerts!' });
});

router.get('/login', (request: Request, response: Response) => {
  if (request.headers.cookie) {
    const cookies = request.headers.cookie.split(';');
    const has_access_token = cookies.find((cookie) => cookie.split('=')[0] === 'AT');

    if (has_access_token) {
      return response.redirect('/');
    }
  }

  return response.render('login', {
    title: 'Login!',
    scripts: getScripts(['captcha', 'validator', 'form']),
    styles: getStyles(['form', 'login']),
    alerts: getAlerts(request.query),
  });
});

router.get('/signup', (request: Request, response: Response) => {
  response.render('signup', {
    title: 'Sign up!',
    scripts: getScripts(['captcha', 'validator', 'form', 'imask']),
    styles: getStyles(['form', 'signup']),
    alerts: getAlerts(request.query),
  });
});

router.get('/confirm-code', (request: Request, response: Response) => {
  if (!request.query.email) {
    return response.redirect('/pages/login');
  }

  return response.render('confirm_code', {
    title: 'Confirmar código!',
    email: request.query.email,
    scripts: getScripts(['validator', 'form']),
    styles: getStyles(['form', 'confirm_code']),
    alerts: getAlerts(request.query),
  });
});

router.get('/forgot-password', (request: Request, response: Response) => {
  response.render('forgot_password', {
    title: 'Esqueceu a senha?',
    scripts: getScripts(['captcha', 'validator', 'form']),
    styles: getStyles(['form', 'forgot_password']),
    alerts: getAlerts(request.query),
  });
});

router.get('/reset-password', (request: Request, response: Response) => {
  if (!request.query.user_id) {
    return response.redirect('/pages/login');
  }

  return response.render('reset_password', {
    title: 'Resetar senha',
    user_id: request.query.user_id,
    scripts: getScripts(['validator', 'form']),
    styles: getStyles(['form', 'reset_password']),
    alerts: getAlerts(request.query),
  });
});

router.get('/500', (_request: Request, response: Response) => {
  response.render('500', {
    title: 'Internal Server Error!',
    styles: getStyles(['500']),
  });
});

export default router;
