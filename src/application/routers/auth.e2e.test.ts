import { faker } from '@faker-js/faker/locale/pt_BR';
import { auth_service } from 'src/bootstrap';

const fetch_spy = jest.spyOn(global, 'fetch');
const verify_captcha_spy = jest.spyOn(auth_service, 'verifyCaptcha');

describe('Auth endpoints', () => {
  describe('POST: /auth/captcha', () => {
    beforeEach(() => {
      fetch_spy.mockClear();
      verify_captcha_spy.mockClear();
    });

    it('returns status code 204 if token is valid', async () => {
      expect.assertions(2);

      fetch_spy.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          challenge_ts: new Date().getTime(),
          hostname: faker.internet.url(),
          'error-codes': [],
        }),
      } as any);

      const token = faker.string.alphanumeric(15);

      const response = await globalThis.request
        .post('/api/auth/captcha')
        .set('Content-Type', 'application/json')
        .send({ token });

      expect(response.status).toEqual(204);
      expect(verify_captcha_spy).toHaveBeenCalledWith('127.0.0.1', token);
    });

    it('returns status code 403 if token is valid', async () => {
      expect.assertions(3);

      fetch_spy.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          challenge_ts: new Date().getTime(),
          hostname: faker.internet.url(),
          'error-codes': [],
        }),
      } as any);

      const token = faker.string.alphanumeric(15);

      const response = await globalThis.request
        .post('/api/auth/captcha')
        .set('Content-Type', 'application/json')
        .send({ token });

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('captcha failed');
      expect(verify_captcha_spy).toHaveBeenCalledWith('127.0.0.1', token);
    });

    it('returns status code 400 if token is not passed', async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .post('/api/auth/captcha')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PATCH: /auth/password/:user_id', () => {
    const user_id = faker.string.uuid();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [
          user_id,
          faker.internet.email(),
          faker.person.fullName(),
          faker.string.alphanumeric(10),
          faker.string.numeric(11),
        ],
      );
    });

    afterAll(async () => {
      await globalThis.db_client.query('DELETE FROM users');
    });

    it('returns status code 204 if password has changed', async () => {
      expect.assertions(1);

      const password = faker.string.alphanumeric(10);

      const response = await globalThis.request
        .patch(`/api/auth/passwords/${user_id}`)
        .set('Content-Type', 'application/json')
        .send({ password });

      expect(response.status).toEqual(204);
    });

    it("returns status code 404 if user doesn't exist", async () => {
      expect.assertions(2);

      const password = faker.string.alphanumeric(15);
      const fake_user_id = faker.string.uuid();

      const response = await globalThis.request
        .patch(`/api/auth/passwords/${fake_user_id}`)
        .set('Content-Type', 'application/json')
        .send({ password });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Usuário não encontrado.');
    });
  });

  describe('POST: /auth/codes', () => {
    const user_email = faker.internet.email();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [
          faker.string.uuid(),
          user_email,
          faker.person.fullName(),
          faker.string.alphanumeric(10),
          faker.string.numeric(11),
        ],
      );
    });

    afterAll(async () => {
      await globalThis.db_client.query('DELETE FROM user_confirmation_codes');
      await globalThis.db_client.query('DELETE FROM users');
    });

    it("returns status code 404 if user doesn't exist", async () => {
      const response = await globalThis.request
        .post('/api/auth/codes')
        .set('Content-Type', 'application/json')
        .send({ email: faker.internet.email() });

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Usuário não encontrado.');
    });

    it('returns status code 204 if code was sent', async () => {
      const response = await globalThis.request
        .post('/api/auth/codes')
        .set('Content-Type', 'application/json')
        .send({ email: user_email });

      expect(response.status).toEqual(204);
    });
  });
});
