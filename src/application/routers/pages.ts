import auth from "@app/middlewares/auth";
import { Request, Response, Router } from "express";

const router = Router();

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

  response.render('login', {
    title: 'Login!',
  });
});

router.get('/register', (_request: Request, response: Response) => {
  response.render('login', {
    title: 'Login!',
  });
});

router.get('/forgot-password', (_request: Request, response: Response) => {
  response.render('login', {
    title: 'Login!',
  });
});


export default router;