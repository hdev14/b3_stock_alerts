
import { NextFunction, Request, Response, Router } from 'express';

// TODO
const router = Router();

router.post(
  '/auth/login',
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      return response.status(204).json();
    } catch (e) {
      return next(e)
    }
  }
);

router.post(
  '/auth/reset-password',
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      return response.status(204).json();
    } catch (e) {
      return next(e)
    }
  }
);

export default router;