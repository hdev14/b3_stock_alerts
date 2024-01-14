import validator from '@api/middlewares/validator';
import BcryptEncryptor from '@b3_stock_alerts/BcryptEncryptor';
import PgUserRepository from '@b3_stock_alerts/PgUserRepository';
import UserService from '@b3_stock_alerts/UserService';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { create_user } from './validations';

const router = Router();
const userService = new UserService(new PgUserRepository(), new BcryptEncryptor());

router.post('/users', checkSchema(create_user), validator, async (request: Request, response: Response, next: NextFunction) => {
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
  } catch(e) {
    return next(e);
  }
});

router.get('/users/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.get('/users', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.put('/users/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.delete('/users/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

export default router;