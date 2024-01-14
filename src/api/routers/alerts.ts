import { Request, Response, Router } from 'express';

const router = Router();
// const alertService = new AlertService(new PgAlertRepository());

router.post('/alerts/', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.delete('/alerts/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

export default router;