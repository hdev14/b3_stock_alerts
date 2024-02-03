import { Request, Response, Router } from "express";


const router = Router();

router.get('/index', (_request: Request, response: Response) => {
  response.render('index', { title: 'Hellow Mustache!' });
});

router.get('/login', (request: Request, response: Response) => {
  console.log(request.headers);
  response.render('login', {
    title: 'Login!',
  });
});

export default router;