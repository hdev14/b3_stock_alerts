import { faker } from "@faker-js/faker/locale/pt_BR";

describe('Alerts endpoints', () => {
  afterAll(async () => {
    await globalThis.db_client.query('DELETE FROM alerts');
    await globalThis.db_client.query('DELETE FROM users');
  });

  describe('POST: /alerts', () => {
    const user_id = faker.string.uuid();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [user_id, faker.internet.email(), faker.person.fullName(), faker.string.alphanumeric(10), faker.string.numeric(11)]
      );
    });

    it('returns 400 if dala is invalid', async () => {
      expect.assertions(2);

      const invalid_body = {
        isMax: faker.string.alphanumeric(),
        user_id: faker.string.alphanumeric(),
        stock: faker.string.alphanumeric(10),
        amount: faker.string.uuid(),
      };

      const response = await globalThis.request
        .post('/api/alerts')
        .set('Content-Type', 'application/json')
        .send(invalid_body)

      expect(response.status).toEqual(400);
      expect(response.body.errors).toHaveLength(4);
    });

    it("returns 422 if user doesn't exist", async () => {
      expect.assertions(2);

      const body = {
        isMax: faker.datatype.boolean(),
        user_id: faker.string.uuid(),
        stock: faker.string.alphanumeric(5),
        amount: faker.number.float(),
      };

      const response = await globalThis.request
        .post('/api/alerts')
        .set('Content-Type', 'application/json')
        .send(body)

      expect(response.status).toEqual(422);
      expect(response.body.message).toEqual('User not found');
    });

    it("creates a new alert", async () => {
      expect.assertions(5);

      const body = {
        isMax: faker.datatype.boolean(),
        user_id,
        stock: faker.string.alphanumeric(5),
        amount: faker.number.float(),
      };

      const response = await globalThis.request
        .post('/api/alerts')
        .set('Content-Type', 'application/json')
        .send(body)

      expect(response.status).toEqual(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.stock).toEqual(body.stock);

      if (body.isMax) {
        expect(response.body.max_amount).toEqual(body.amount);
        expect(response.body.min_amount).toBeUndefined();
      } else {
        expect(response.body.min_amount).toEqual(body.amount);
        expect(response.body.max_amount).toBeUndefined();
      }
    });
  });
});