import { Request, Response, Router } from 'express';

const router = Router();
// const userService = new UserService(new PgUserRepository(), new BcryptEncryptor());

router.post('/', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.get('/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.get('', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.put('/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

router.delete('/:id', (_request: Request, response: Response) => {
  return response.status(204).json();
});

export default router;