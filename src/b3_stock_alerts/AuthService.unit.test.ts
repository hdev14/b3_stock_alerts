import { faker } from '@faker-js/faker/locale/pt_BR';
import CredentialError from '@shared/CredentialError';
import ExpiredCodeError from '@shared/ExpiredCodeError';
import NotFoundError from '@shared/NotFoundError';
import crypto from 'crypto';
import AuthService from './AuthService';
import { User } from './User';

describe("AuthService's unit tests", () => {
  const user_repository_mock = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    getUsers: jest.fn(),
    getUserByEmail: jest.fn(),
    createConfirmationCode: jest.fn(),
    getConfirmationCode: jest.fn(),
  };

  const encryptor_mock = {
    createHash: jest.fn(),
    compareHash: jest.fn(),
  };

  const authenticator_mock = {
    generateAuthToken: jest.fn(),
    verifyAuthToken: jest.fn(),
    resetAuthToken: jest.fn(),
    verifyCaptcha: jest.fn(),
  };

  const confirmation_code_mock = {
    sendCode: jest.fn(),
  };

  const reset_password = {
    sendResetPasswordLink: jest.fn(),
  };

  const auth_service = new AuthService(
    user_repository_mock,
    encryptor_mock,
    authenticator_mock,
    confirmation_code_mock,
    reset_password,
  );

  describe('AuthService.login', () => {
    it("returns a result with CredentialError if user doesn't exist", async () => {
      expect.assertions(1);

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(null);

      const email = faker.internet.email();
      const password = faker.string.alphanumeric(10);

      const [error] = await auth_service.login(email, password);

      expect(error).toBeInstanceOf(CredentialError);
    });

    it('returns a result with CredentialError if password is wrong', async () => {
      expect.assertions(1);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(user);
      encryptor_mock.compareHash.mockReturnValueOnce(false);

      const email = faker.internet.email();
      const password = faker.string.alphanumeric(10);

      const [error] = await auth_service.login(email, password);

      expect(error).toBeInstanceOf(CredentialError);
    });

    it('returns a result with user and auth data if credentials are correct', async () => {
      expect.assertions(3);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(user);
      encryptor_mock.compareHash.mockReturnValueOnce(true);
      authenticator_mock.generateAuthToken.mockReturnValueOnce({
        token: 'fake_token',
        expired_at: new Date(),
      });

      const email = faker.internet.email();
      const password = faker.string.alphanumeric(10);

      const [, data] = await auth_service.login(email, password);

      if (data) {
        expect(data.user).toBe(user);
        expect(data.token).toBe('fake_token');
        expect(data.expired_at).toBeInstanceOf(Date);
      }
    });
  });

  describe('AuthService.sendConfirmationCode', () => {
    const random_int_spy = jest.spyOn(crypto, 'randomInt');

    afterEach(() => {
      random_int_spy.mockClear();
      user_repository_mock.createConfirmationCode.mockClear();
      confirmation_code_mock.sendCode.mockClear();
    });

    it("return result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(1);

      const email = faker.internet.email();

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(null);

      const [error] = await auth_service.sendConfirmationCode(email);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('calls ConfirmationCode.sendCode with correct code and email', async () => {
      expect.assertions(3);

      const email = faker.internet.email();

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(user);

      await auth_service.sendConfirmationCode(email);

      expect(random_int_spy).toHaveBeenCalledWith(1000, 9999);
      const call = confirmation_code_mock.sendCode.mock.calls[0];

      expect(call[0].email).toEqual(email);
      expect(call[0].code).toBeDefined();
    });

    it('saves the code after send it for user email', async () => {
      expect.assertions(4);

      const email = faker.internet.email();

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      random_int_spy.mockReturnValueOnce(1234 as any);
      user_repository_mock.getUserByEmail.mockResolvedValueOnce(user);

      await auth_service.sendConfirmationCode(email);

      const params = user_repository_mock.createConfirmationCode.mock.calls[0][0];

      expect(params.id).toBeDefined();
      expect(params.user_id).toBe(user.id);
      expect(params.code).toBe('1234');
      expect(params.expired_at).toBeInstanceOf(Date);
    });
  });

  describe('AuthService.confirmCode', () => {
    afterEach(() => {
      user_repository_mock.getConfirmationCode.mockClear();
    });

    it("returns a result with false if code doesn't exist", async () => {
      expect.assertions(1);

      const email = faker.internet.email();
      const code = faker.string.numeric(4);

      user_repository_mock.getConfirmationCode.mockResolvedValueOnce(null);

      const [, data] = await auth_service.confirmCode(email, code);

      expect(data).toEqual(false);
    });

    it('returns a result with true if code exists', async () => {
      expect.assertions(1);

      const email = faker.internet.email();
      const code = faker.string.numeric(4);

      const confirmation_code = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        code: faker.string.numeric(4),
        expired_at: faker.date.future(),
      };

      user_repository_mock.getConfirmationCode.mockResolvedValueOnce(confirmation_code);

      const [, data] = await auth_service.confirmCode(email, code);

      expect(data).toEqual(true);
    });

    it('returns a result with ExpiredCodeError if code expired', async () => {
      expect.assertions(1);

      const email = faker.internet.email();
      const code = faker.string.numeric(4);

      const confirmation_code = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        code: faker.string.numeric(4),
        expired_at: faker.date.past(),
      };

      user_repository_mock.getConfirmationCode.mockResolvedValueOnce(confirmation_code);

      const [error] = await auth_service.confirmCode(email, code);

      expect(error).toBeInstanceOf(ExpiredCodeError);
    });
  });

  describe('AuthService.forgotPassword', () => {
    afterEach(() => {
      user_repository_mock.getUserByEmail.mockClear();
    });

    it("returns a result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(1);

      const email = faker.internet.email();

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(null);

      const [error] = await auth_service.forgotPassword(email);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('sends a forgot password link if user exists', async () => {
      expect.assertions(1);

      const email = faker.internet.email();

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      user_repository_mock.getUserByEmail.mockResolvedValueOnce(user);

      await auth_service.forgotPassword(email);

      expect(reset_password.sendResetPasswordLink).toHaveBeenCalledWith({
        email: user.email,
        user_id: user.id,
      });
    });
  });

  describe('AuthService.resetPassword', () => {
    afterEach(() => {
      user_repository_mock.getUser.mockClear();
      user_repository_mock.updateUser.mockClear();
      encryptor_mock.createHash.mockClear();
    });

    it("returns a result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(1);

      const user_id = faker.string.uuid();
      const new_password = faker.string.alphanumeric(10);

      user_repository_mock.getUser.mockResolvedValueOnce(null);

      const [error] = await auth_service.resetPassword(user_id, new_password);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('updates the user password', async () => {
      expect.assertions(1);

      const user_id = faker.string.uuid();
      const new_password = faker.string.alphanumeric(10);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      user_repository_mock.getUser.mockResolvedValueOnce(user);
      encryptor_mock.createHash.mockReturnValueOnce('fake_hash');

      await auth_service.resetPassword(user_id, new_password);

      expect(user_repository_mock.updateUser).toHaveBeenCalledWith({
        ...user,
        password: 'fake_hash',
      });
    });
  });
});
