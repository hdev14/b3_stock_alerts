import { faker } from "@faker-js/faker/locale/pt_BR";

describe('Users endpoints', () => {
  afterEach(async () => {
    await globalThis.db_client.query('DELETE FROM users');
  });

  describe('POST: /users', () => {
    it('creates a new user', async () => {
      expect.assertions(6);

      const body = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone_number: faker.string.numeric(11),
        password: faker.string.alphanumeric(10),
      };

      const response = await globalThis.request
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toEqual(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toEqual(body.name);
      expect(response.body.email).toEqual(body.email);
      expect(response.body.phone_number).toEqual(body.phone_number);
      expect(response.body.password).toBeDefined();
    });

    it('returns 400 if data is invalid', async () => {
      expect.assertions(2);

      const body = {
        name: faker.number.int(),
        email: faker.person.fullName(),
        phone_number: faker.string.alphanumeric(12),
        password: faker.string.alpha(6),
      };

      const response = await globalThis.request
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toEqual(400);
      expect(response.body.errors).toHaveLength(4);
    });
  });

  describe('GET: /users/:id', () => {
    const user_id = faker.string.uuid();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [user_id, faker.internet.email(), faker.person.fullName(), faker.string.alphanumeric(10), faker.string.numeric(11)]
      );
    });

    it('returns an user by id', async () => {
      expect.assertions(5);

      const response = await globalThis.request
        .get(`/api/users/${user_id}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(user_id);
      expect(response.body.name).toBeDefined();
      expect(response.body.email).toBeDefined();
      expect(response.body.phone_number).toBeDefined();
    });

    it("returns not found if user doesn't exist", async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .get(`/api/users/${faker.string.uuid()}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('User not found');
    });
  });

  describe('GET: /users', () => {
    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [faker.string.uuid(), faker.internet.email(), faker.person.fullName(), faker.string.alphanumeric(10), faker.string.numeric(11)]
      );

      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [faker.string.uuid(), faker.internet.email(), faker.person.fullName(), faker.string.alphanumeric(10), faker.string.numeric(11)]
      );
    });

    it('returns an array of users', async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .get('/api/users')
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('DELETE: /users/:id', () => {
    const user_id = faker.string.uuid();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [user_id, faker.internet.email(), faker.person.fullName(), faker.string.alphanumeric(10), faker.string.numeric(11)]
      );
    });
    
    it("deletes an user by id", async () => {
      expect.assertions(1);

      const response = await globalThis.request
        .delete(`/api/users/${user_id}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(204);
    });

    it("returns not found if user doesn't exist", async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .delete(`/api/users/${user_id}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('User not found');
    });
  });
});