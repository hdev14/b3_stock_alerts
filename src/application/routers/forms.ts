import { Request, Response, Router } from 'express';

const router = Router();

router.post('/login', (request: Request, response: Response) => {
  console.log(request.body);
  response.redirect('/');
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