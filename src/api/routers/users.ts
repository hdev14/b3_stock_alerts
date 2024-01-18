import validator from '@api/middlewares/validator';
import BcryptEncryptor from '@b3_stock_alerts/BcryptEncryptor';
import PgUserRepository from '@b3_stock_alerts/PgUserRepository';
import UserService from '@b3_stock_alerts/UserService';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { create_user } from './validations';
import NotFoundError from '@shared/NotFoundError';

const router = Router();
const userService = new UserService(new PgUserRepository(), new BcryptEncryptor());

router.post('/users',
  checkSchema(create_user),
  validator,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        phone_number,
        password
      } = request.body;

      const result = await userService.createUser({ name, email, phone_number, password });

      if (result.data) {
        return response.status(201).json(result.data);
      }
    } catch (e) {
      return next(e);
    }
  }
);

router.get('/users/:id', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const result = await userService.getUser(request.params.id);
    if (result.error instanceof NotFoundError) {
      return response.status(404).json({ message: result.error.message });
    }

    return response.status(200).json(result.data);
  } catch (e) {
    return next(e);
  }
});

router.get('/users', (_request: Request, response: Response, next: NextFunction) => {
  try {
    return response.status(204).json();
  } catch (e) {
    return next(e);
  }
});

router.put('/users/:id', (_request: Request, response: Response, next: NextFunction) => {
  try {
    return response.status(204).json();
  } catch (e) {
    return next(e);
  }
});

router.delete('/users/:id', (_request: Request, response: Response, next: NextFunction) => {
  try {
    return response.status(204).json();
  } catch (e) {
    return next(e);
  }
});

export default router;