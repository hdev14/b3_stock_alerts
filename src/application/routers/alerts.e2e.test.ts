import { faker } from '@faker-js/faker/locale/pt_BR';

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
        [
          user_id,
          faker.internet.email(),
          faker.person.fullName(),
          faker.string.alphanumeric(10),
          faker.string.numeric(11),
        ],
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
        .send(invalid_body);

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
        .send(body);

      expect(response.status).toEqual(422);
      expect(response.body.message).toEqual('User not found');
    });

    it('creates a new alert', async () => {
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
        .send(body);

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

  describe('DELETE: /alerts/:id', () => {
    const alert_id = faker.string.uuid();

    beforeAll(async () => {
      const user_id = faker.string.uuid();

      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [
          user_id,
          faker.internet.email(),
          faker.person.fullName(),
          faker.string.alphanumeric(10),
          faker.string.numeric(11),
        ],
      );

      await globalThis.db_client.query(
        'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
        [
          alert_id,
          faker.string.alphanumeric(6),
          user_id,
          faker.number.float(),
          faker.number.float(),
        ],
      );
    });

    it("returns not found if alert doesn't exist", async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .delete(`/api/alerts/${faker.string.uuid()}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Alert not found');
    });

    it('deletes an alert by id', async () => {
      expect.assertions(1);

      const response = await globalThis.request
        .delete(`/api/alerts/${alert_id}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(204);
    });
  });

  describe('GET: /alerts/users/:id', () => {
    const user_id = faker.string.uuid();

    beforeAll(async () => {
      await globalThis.db_client.query(
        'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [
          user_id,
          faker.internet.email(),
          faker.person.fullName(),
          faker.string.alphanumeric(10),
          faker.string.numeric(11),
        ],
      );

      await globalThis.db_client.query(
        'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
        [
          faker.string.uuid(),
          faker.string.alphanumeric(6),
          user_id,
          faker.number.float(),
          faker.number.float(),
        ],
      );

      await globalThis.db_client.query(
        'INSERT INTO alerts (id, stock, user_id, max_amount, min_amount) VALUES ($1, $2, $3, $4, $5)',
        [
          faker.string.uuid(),
          faker.string.alphanumeric(6),
          user_id,
          faker.number.float(),
          faker.number.float(),
        ],
      );
    });

    it("returns not found if user doesn't exist", async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .get(`/api/alerts/users/${faker.string.uuid()}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('User not found');
    });

    it("returns an array of user's alerts", async () => {
      expect.assertions(2);

      const response = await globalThis.request
        .get(`/api/alerts/users/${user_id}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(2);
    });
  });
});
