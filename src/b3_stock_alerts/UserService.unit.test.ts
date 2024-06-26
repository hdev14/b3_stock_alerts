import { faker } from '@faker-js/faker/locale/pt_BR';
import EmailAlreadyRegisteredError from '@shared/EmailAlreadyRegisteredError';
import NotFoundError from '@shared/NotFoundError';
import { User } from './User';
import UserService from './UserService';

describe("UserService's unit tests", () => {
  const repository_mock = {
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

  const service = new UserService(repository_mock, encryptor_mock);

  describe('UserService.getUser', () => {
    afterEach(() => {
      repository_mock.getUser.mockClear();
    });

    it('returns a Result with an user', async () => {
      expect.assertions(2);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      };

      repository_mock.getUser.mockResolvedValueOnce(user);

      const [error, data] = await service.getUser(faker.string.uuid());

      expect(data).toEqual(user);
      expect(error).toBeUndefined();
    });

    it("returns a Result with a NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      repository_mock.getUser.mockResolvedValueOnce(null);

      const [error, data] = await service.getUser(faker.string.uuid());

      expect(data).toEqual({});
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('UserService.listUsers', () => {
    afterEach(() => {
      repository_mock.getUsers.mockClear();
    });

    it('returns a Result with an array of users', async () => {
      expect.assertions(3);

      const users: Array<User> = [
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(),
          phone_number: faker.string.numeric(11),
        },
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(),
          phone_number: faker.string.numeric(11),
        },
      ];

      repository_mock.getUsers.mockResolvedValueOnce(users);

      const [, data] = await service.listUsers();

      if (data) {
        expect(data).toHaveLength(2);
        expect(data[0]).toEqual(users[0]);
        expect(data[1]).toEqual(users[1]);
      }
    });
  });

  describe('UserService.createUser', () => {
    afterEach(() => {
      repository_mock.createUser.mockClear();
      encryptor_mock.createHash.mockClear();
    });

    it('generates a hash of the password before of the creation', async () => {
      expect.assertions(1);

      const params = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      await service.createUser(params);

      expect(encryptor_mock.createHash).toHaveBeenCalledWith(params.password);
    });

    it('creates a new user', async () => {
      expect.assertions(6);

      const params = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      encryptor_mock.createHash.mockReturnValueOnce('test');

      const [, data] = await service.createUser(params);

      if (data) {
        expect(repository_mock.createUser).toHaveBeenCalled();
        expect(data.id).toBeDefined();
        expect(data.email).toEqual(params.email);
        expect(data.name).toEqual(params.name);
        expect(data.password).toEqual('test');
        expect(data.phone_number).toEqual(params.phone_number);
      }
    });

    it('returns result with EmailAlreadyRegisteredError if email already exists', async () => {
      expect.assertions(2);

      const params = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      repository_mock.getUserByEmail.mockResolvedValueOnce({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      });
      encryptor_mock.createHash.mockReturnValueOnce('test');

      const [error] = await service.createUser(params);

      expect(repository_mock.getUserByEmail).toHaveBeenCalledWith(params.email);
      expect(error).toBeInstanceOf(EmailAlreadyRegisteredError);
    });
  });

  describe('UserService.updateUser', () => {
    afterEach(() => {
      repository_mock.updateUser.mockClear();
      encryptor_mock.createHash.mockClear();
    });

    it("returns a Result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      const params = {
        user_id: faker.string.uuid(),
      };

      const [error, data] = await service.updateUser(params);

      expect(data).toEqual({});
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('generates a new password hash if the field is passed', async () => {
      expect.assertions(1);

      const params = {
        user_id: faker.string.uuid(),
        password: faker.string.alphanumeric(10),
      };

      const user = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      };

      repository_mock.getUser.mockResolvedValueOnce(user);

      await service.updateUser(params);

      expect(encryptor_mock.createHash).toHaveBeenCalledWith(params.password);
    });

    it('updates an user', async () => {
      expect.assertions(7);

      const params = {
        user_id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone_number: faker.string.numeric(11),
      };

      const user = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      };

      repository_mock.getUser.mockResolvedValueOnce(user);

      const [error, data] = await service.updateUser(params);

      if (data) {
        expect(repository_mock.updateUser).toHaveBeenCalled();
        expect(data.id).toBeDefined();
        expect(data.name).toEqual(params.name);
        expect(data.email).toEqual(params.email);
        expect(data.phone_number).toEqual(params.phone_number);
        expect(data.password).toEqual(user.password);
        expect(error).toBeUndefined();
      }
    });
  });

  describe('UserService.removeUser', () => {
    afterEach(() => {
      repository_mock.deleteUser.mockClear();
      repository_mock.getUser.mockClear();
    });

    it("returns a Result with a NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      repository_mock.getUser.mockResolvedValueOnce(null);

      const [error] = await service.removeUser(faker.string.uuid());

      expect(repository_mock.getUser).toHaveBeenCalled();
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('deletes an user', async () => {
      expect.assertions(1);

      repository_mock.getUser.mockResolvedValueOnce({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      });

      await service.removeUser(faker.string.uuid());

      expect(repository_mock.getUser).toHaveBeenCalled();
    });
  });
});
