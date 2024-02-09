import { Request, Response, Router } from 'express';

const router = Router();

router.post('/login', (request: Request, response: Response) => {
  console.log('form', request.body);
  if (request.body.email !== 'ne.hermerson@gmail.com') {
    return response.redirect('/pages/login');
  }

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