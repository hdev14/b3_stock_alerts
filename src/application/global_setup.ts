import { faker } from '@faker-js/faker';
import { type FullConfig } from '@playwright/test';
import Postgres from '@shared/Postgres';

async function globalTeardown(_config: FullConfig) {
  const db_client = Postgres.getClient();
  await db_client.connect();

  const user = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.string.alphanumeric(100),
    phone_number: faker.string.numeric(11),
  };

  await db_client.query(
    'INSERT INTO users (id, email, name, password, phone_number) VALUES ($1, $2, $3, $4, $5)',
    Object.values(user),
  );

  process.env.USER_TEST = JSON.stringify(user);
}

export default globalTeardown;
