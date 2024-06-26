import { faker } from '@faker-js/faker/locale/pt_BR';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { UserData } from './Authenticator';
import CoreAuthenticator from './CoreAuthenticator';

jest.mock('jsonwebtoken');

const jwt_mocked = jest.mocked(jwt);

const fetch_spy = jest.spyOn(global, 'fetch');

describe("CoreAuthenticator's unit tests", () => {
  const authenticator = new CoreAuthenticator();

  afterEach(() => {
    fetch_spy.mockClear();
    jwt_mocked.sign.mockClear();
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
          'error-codes': [],
        }),
      } as any);

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      const result = await authenticator.verifyCaptcha(user_ip, token);

      expect(result).toBe(true);
      expect(fetch_spy).toHaveBeenCalledWith(`https://www.google.com/recaptcha/api/siteverify?secret=fake_google_recaptcha_secret&response=${token}&remoteip=${user_ip}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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
          'error-codes': [],
        }),
      } as any);

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      const result = await authenticator.verifyCaptcha(user_ip, token);

      expect(result).toBe(false);
      expect(fetch_spy).toHaveBeenCalledWith(`https://www.google.com/recaptcha/api/siteverify?secret=fake_google_recaptcha_secret&response=${token}&remoteip=${user_ip}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    });

    it('throws an error if response returns error validations', async () => {
      expect.assertions(1);

      fetch_spy.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          'error-codes': [
            'missing-input-secret',
            'invalid-input-secret',
            'missing-input-response',
            'invalid-input-response',
            'bad-request',
            'timeout-or-duplicate',
          ],
        }),
      } as any);

      const user_ip = faker.internet.ipv4();
      const token = faker.string.alphanumeric(15);

      try {
        await authenticator.verifyCaptcha(user_ip, token);
      } catch (e: any) {
        expect(e.message).toEqual('Google recaptcha bad request: [missing-input-secret,invalid-input-secret,missing-input-response,invalid-input-response,bad-request,timeout-or-duplicate]');
      }
    });
  });

  describe('CoreAuthenticator.generateAuthToken', () => {
    it('generates a json web token', async () => {
      expect.assertions(3);

      const user: UserData = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone_number: faker.string.numeric(11),
      };

      jwt_mocked.sign.mockReturnValueOnce('fake_token' as any);

      const data = authenticator.generateAuthToken(user);

      expect(jwt_mocked.sign).toHaveBeenCalledWith(user, 'fake_private_key', {
        expiresIn: 60 * 60,
      });
      expect(data.token).toEqual('fake_token');
      expect(data.expired_at).toBeInstanceOf(Date);
    });
  });

  describe('CoreAuthenticator.verifyAuthToken', () => {
    it('returns NULL if token is invalid', async () => {
      expect.assertions(2);

      const token = faker.string.alphanumeric();

      jwt_mocked.verify.mockImplementationOnce(() => {
        throw new JsonWebTokenError('test');
      });

      const result = authenticator.verifyAuthToken(token);

      expect(jwt_mocked.verify).toHaveBeenCalledWith(token, 'fake_private_key');
      expect(result).toBeNull();
    });

    it('returns the user data if token is valid', async () => {
      expect.assertions(2);

      const token = faker.string.alphanumeric();

      const user: UserData = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone_number: faker.string.numeric(11),
      }

      jwt_mocked.verify.mockReturnValueOnce(user as any);

      const result = authenticator.verifyAuthToken(token);

      expect(jwt_mocked.verify).toHaveBeenCalledWith(token, 'fake_private_key');
      expect(result).toEqual(user);
    });
  });
});
