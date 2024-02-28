import { faker } from '@faker-js/faker';
import { type FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  const user = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.string.alphanumeric(100),
    phone_number: faker.string.numeric(11),
  };

  const response = await fetch(`${process.env.SERVER_URL}/api/users`, {
    method: 'post',
    body: JSON.stringify(user),
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status >= 400) {
    console.log(await response.json());
    throw new Error('Usuário não criado.');
  }

  process.env.USER_TEST = JSON.stringify(user);
}

export default globalTeardown;
