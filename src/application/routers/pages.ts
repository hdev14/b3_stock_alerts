import { Request, Response, Router } from "express";


const router = Router();

router.get('/index', (_request: Request, response: Response) => {
  response.render('index', { title: 'Hellow Mustache!' });
});

router.get('/login', (_request: Request, response: Response) => {
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