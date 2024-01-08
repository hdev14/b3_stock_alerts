import { faker } from "@faker-js/faker/locale/pt_BR";
import NotFoundError from "@shared/NotFoundError";
import { User } from "./User";
import UserService from "./UserService";

describe("UserService's unit tests", () => {
  const repositoryMock = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
    getUsers: jest.fn(),
  };

  const encryptorMock = {
    createHash: jest.fn(),
  }

  const service = new UserService(repositoryMock, encryptorMock);

  describe('UserService.getUser', () => {
    afterEach(() => {
      repositoryMock.getUser.mockClear();
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

      repositoryMock.getUser.mockResolvedValueOnce(user);

      const result = await service.getUser(faker.string.uuid());

      expect(result.data).toEqual(user);
      expect(result.error).toBeUndefined();
    });

    it("returns a Result with a NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      repositoryMock.getUser.mockResolvedValueOnce(null);

      const result = await service.getUser(faker.string.uuid());

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('UserService.listUsers', () => {
    afterEach(() => {
      repositoryMock.getUsers.mockClear();
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
        }
      ];

      repositoryMock.getUsers.mockResolvedValueOnce(users);

      const result = await service.listUsers();

      if (result.data) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual(users[0]);
        expect(result.data[1]).toEqual(users[1]);
      }
    });
  });

  describe('UserService.createUser', () => {
    afterEach(() => {
      repositoryMock.createUser.mockClear();
      encryptorMock.createHash.mockClear();
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

      expect(encryptorMock.createHash).toHaveBeenCalledWith(params.password);
    });

    it('creates a new user', async () => {
      expect.assertions(6);

      const params = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      encryptorMock.createHash.mockReturnValueOnce('test');

      const result = await service.createUser(params);

      if (result.data) {
        expect(repositoryMock.createUser).toHaveBeenCalled();
        expect(result.data.id).toBeDefined();
        expect(result.data.email).toEqual(params.email);
        expect(result.data.name).toEqual(params.name);
        expect(result.data.password).toEqual('test');
        expect(result.data.phone_number).toEqual(params.phone_number);
      }
    });
  });

  describe('UserService.updateUser', () => {
    afterEach(() => {
      repositoryMock.updateUser.mockClear();
      encryptorMock.createHash.mockClear();
    });

    it("returns a Result with NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      const params = {
        user_id: faker.string.uuid(),
      };

      const result = await service.updateUser(params);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(NotFoundError);
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

      repositoryMock.getUser.mockResolvedValueOnce(user);

      await service.updateUser(params);

      expect(encryptorMock.createHash).toHaveBeenCalledWith(params.password);
    });

    it("updates an user", async () => {
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

      repositoryMock.getUser.mockResolvedValueOnce(user);

      const result = await service.updateUser(params);

      if (result.data) {
        expect(repositoryMock.updateUser).toHaveBeenCalled();
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toEqual(params.name);
        expect(result.data.email).toEqual(params.email);
        expect(result.data.phone_number).toEqual(params.phone_number);
        expect(result.data.password).toEqual(user.password);
        expect(result.error).toBeUndefined();
      }
    });
  })

  describe('UserService.removeUser', () => {
    afterEach(() => {
      repositoryMock.deleteUser.mockClear();
      repositoryMock.getUser.mockClear();
    });

    it("returns a Result with a NotFoundError if user doesn't exist", async () => {
      expect.assertions(2);

      repositoryMock.getUser.mockResolvedValueOnce(null);

      const result = await service.removeUser(faker.string.uuid());

      if (result) {
        expect(repositoryMock.getUser).toHaveBeenCalled();
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });

    it("deletes an user", async () => {
      expect.assertions(1);

      repositoryMock.getUser.mockResolvedValueOnce({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(),
        phone_number: faker.string.numeric(11),
      });

      await service.removeUser(faker.string.uuid());

      expect(repositoryMock.getUser).toHaveBeenCalled();
    });
  });
});