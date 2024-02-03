import { Request, Response, Router } from "express";


const router = Router();

router.get('/index', (_request: Request, response: Response) => {
  response.render('index', { title: 'Hellow Mustache!' });
});

export default router;