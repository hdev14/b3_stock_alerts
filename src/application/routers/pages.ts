import auth from '@app/middlewares/auth';
import { Request, Response, Router } from 'express';

const router = Router();

const LINKS: Record<string, string> = {};

const SCRIPTS: Record<string, string> = {
  captcha: 'https://www.google.com/recaptcha/api.js?render=6LdAc2UpAAAAAObuHow9pOS5dy0coRW11AKKiWJA',
  validator: '/js/validator.js',
  login_form: '/js/login_form.js',
  signup_form: '/js/signup_form.js',
  imask: 'https://unpkg.com/imask',
};

function getLinkUrls(link_names: string[]) {
  const link_keys = Object.keys(LINKS).filter((key) => link_names.includes(key));
  return link_keys.map((key) => ({ url: LINKS[key] }));
}

function getScriptUrls(script_names: string[]) {
  const script_keys = Object.keys(SCRIPTS).filter((key) => script_names.includes(key));
  return script_keys.map((key) => ({ url: SCRIPTS[key] }));
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
    scripts: getScriptUrls(['captcha', 'validator', 'login_form']),
  });
});

router.get('/signup', (_request: Request, response: Response) => {
  response.render('signup', {
    title: 'Sign up!',
    scripts: getScriptUrls(['captcha', 'validator', 'signup_form', 'imask']),
  });
});

router.get('/confirm-code', (_request: Request, response: Response) => {
  response.render('confirm-code', {
    title: 'Confirmar código!',
  });
});

router.get('/forgot-password', (_request: Request, response: Response) => {
  response.render('login', {
    title: 'Login!',
  });
});

export default router;
