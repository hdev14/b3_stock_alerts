import { faker } from "@faker-js/faker/locale/pt_BR";

describe('Users endpoints', () => {
  afterAll(async () => {
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
        .post('/v1/users')
        .set('Content-Type', 'application/json')
        .send(body);

      console.log(response.body.errors);
      expect(response.status).toEqual(400);
      expect(response.body.errors).toHaveLength(4);
    });
  });
});