/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker/locale/pt_BR';
import Postgres from "@shared/Postgres";
import PgUserRepository from './PgUserRepository';
import { User } from "./User";

const getClientSpy = jest.spyOn(Postgres, 'getClient');

afterEach(() => {
  getClientSpy.mockClear();
});

describe('PgUserRepository', () => {
  const queryMock = jest.fn();
  getClientSpy.mockImplementation(() => ({ query: queryMock } as any));
  const repository = new PgUserRepository();

  afterEach(() => {
    queryMock.mockClear();
  });

  describe('PgUserRepository.createUser', () => {
    it('inserts a new user', async () => {
      expect.assertions(1);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      await repository.createUser(user);

      expect(queryMock).toHaveBeenCalledWith('INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)', [
        user.id, user.email, user.name, user.password, user.phone_number,
      ]);
    });
  });

  describe('PgUserRepository.updateUser', () => {
    it('updates an user', async () => {
      expect.assertions(1);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      await repository.updateUser(user);

      expect(queryMock).toHaveBeenCalledWith('UPDATE users SET email = $2, name = $3, password = $4, phone_number = $5 WHERE id = $1', [
        user.id, user.email, user.name, user.password, user.phone_number,
      ]);
    });
  });

  describe('PgUserRepository.getUser', () => {
    it('returns an user by id', async () => {
      expect.assertions(2);

      const user: User = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.string.alphanumeric(10),
        phone_number: faker.string.numeric(11),
      };

      queryMock.mockResolvedValueOnce({ rows: [user] });

      const result = await repository.getUser(user.id);

      expect(queryMock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE id = $1', [user.id]);
      expect(result).toEqual(user);
    });

    it("returns NULL if user doesn't exit", async () => {
      expect.assertions(2);
      
      const user_id = faker.string.uuid();

      queryMock.mockResolvedValueOnce({ rows: [] });

      const result = await repository.getUser(user_id);

      expect(queryMock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users WHERE id = $1', [user_id]);
      expect(result).toBeNull();
    });
  });

  describe('PgUserRepository.getUsers', () => {
    it('returns an array of users', async () => {
      expect.assertions(2);

      const users: Array<User> = [
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(10),
          phone_number: faker.string.numeric(11),
        },
        {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: faker.string.alphanumeric(10),
          phone_number: faker.string.numeric(11),
        }
      ];

      queryMock.mockResolvedValueOnce({ rows: users });

      const result = await repository.getUsers();

      expect(queryMock).toHaveBeenCalledWith('SELECT id, email, name, password, phone_number FROM users');
      expect(result).toEqual(users);
    });
  });

  describe('PgUserRepository.deleteUser', () => {
    it('deletes an user by id', async () => {
      expect.assertions(1);
      
      const user_id = faker.string.uuid();

      await repository.deleteUser(user_id);

      expect(queryMock).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [user_id]);
    });
  });
})