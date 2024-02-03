import { faker } from "@faker-js/faker/locale/pt_BR";
import CoreAuthenticator from "./CoreAuthenticator";

const fetch_spy = jest.spyOn(global, 'fetch');

describe("CoreAuthenticator's unit tests", () => {
  const authenticator = new CoreAuthenticator();

  afterEach(() => {
    fetch_spy.mockClear();
  });

  describe('CoreAuthenticator.verifyCaptcha', () => {
    it('returns TRUE if token is valid', async () => {
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

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      const result = await authenticator.verifyCaptcha(user_ip, token);

      expect(result).toBe(true);
      expect(fetch_spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: JSON.stringify({
          secret: 'fake_google_recaptcha_secret',
          response: token,
          remoteip: user_ip,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('returns FALSE if token is invalid', async () => {
      expect.assertions(2);

      fetch_spy.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          challenge_ts: new Date().getTime(),
          hostname: faker.internet.url(),
          "error-codes": [],
        })
      } as any);

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      const result = await authenticator.verifyCaptcha(user_ip, token);

      expect(result).toBe(false);
      expect(fetch_spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: JSON.stringify({
          secret: 'fake_google_recaptcha_secret',
          response: token,
          remoteip: user_ip,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('throws an error if response returns error validations', async () => {
      expect.assertions(1);

      fetch_spy.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          "error-codes": [
            'missing-input-secret',
            'invalid-input-secret',
            'missing-input-response',
            'invalid-input-response',
            'bad-request',
            'timeout-or-duplicate'
          ],
        })
      } as any);

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      try {
        await authenticator.verifyCaptcha(user_ip, token);
      } catch (e: any) {
        expect(e.message).toEqual("Google recaptcha bad request: [missing-input-secret,invalid-input-secret,missing-input-response,invalid-input-response,bad-request,timeout-or-duplicate]");
      }
    });
  });
})