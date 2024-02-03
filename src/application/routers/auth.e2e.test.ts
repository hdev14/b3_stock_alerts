import { faker } from "@faker-js/faker/locale/pt_BR";
import { authenticator } from "src/bootstrap";

const fetch_spy = jest.spyOn(global, 'fetch');
const verify_captcha_spy = jest.spyOn(authenticator, 'verifyCaptcha');

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
          "error-codes": [],
        })
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
          "error-codes": [],
        })
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
      expect(response.body.errors).toBeDefined()
    });
  });
})