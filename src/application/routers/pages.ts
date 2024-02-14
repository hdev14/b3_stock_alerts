import auth from '@app/middlewares/auth';
import { Request, Response, Router } from 'express';
import QueryString from 'qs';
import { getScripts, getStyles } from './scripts_and_styles';

const router = Router();

function getAlerts(query: QueryString.ParsedQs) {
  const { error_message } = query;
  const alerts = [];

  if (error_message) {
    alerts.push({ message: error_message });
  }
  return alerts;
}

router.get('/index', auth, (_request: Request, response: Response) => {
  response.render('index', { title: 'Hellow Mustache!' });
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
    links: getStyles(['form', 'login']),
    alerts: getAlerts(request.query),
  });
});

router.get('/signup', (request: Request, response: Response) => {
  response.render('signup', {
    title: 'Sign up!',
    scripts: getScripts(['captcha', 'validator', 'form', 'imask']),
    links: getStyles(['form', 'signup']),
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
    scripts: getScripts(['captcha', 'validator', 'form']),
    links: getStyles(['form', 'confirm_code']),
    alerts: getAlerts(request.query),
  });
});

router.get('/forgot-password', (_request: Request, response: Response) => {
  response.render('login', {
    title: 'Login!',
  });
});

router.get('/500', (_request: Request, response: Response) => {
  response.render('500', {
    title: 'Internal Server Error!',
    links: getStyles(['500']),
  });
});

export default router;
