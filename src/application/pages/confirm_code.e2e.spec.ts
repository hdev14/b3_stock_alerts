import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';
import Postgres from '@shared/Postgres';

test.describe('Confirm Code Page', () => {
  const db_client = Postgres.getClient();
  let user_id = '';
  const confirmation_code = faker.string.numeric(4);

  const user = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: `${faker.string.alphanumeric(10)}!@#$`,
    phone_number: faker.string.numeric(11),
  };

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/users', {
      data: user,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    user_id = data.id;

    await db_client.connect();

    const expired_at = new Date();
    expired_at.setHours(expired_at.getHours() - 1);

    await db_client.query(
      'INSERT INTO user_confirmation_codes (id, user_id, code, expired_at) VALUES ($1, $2, $3, $4)',
      [
        faker.string.uuid(),
        user_id,
        confirmation_code,
        `${expired_at.getFullYear()}-${expired_at.getMonth() + 1}-${expired_at.getDate()} ${expired_at.getHours()}:${expired_at.getMinutes()}:${expired_at.getSeconds()}`,
      ],
    );
  });

  test.afterAll(async () => {
    await db_client.query('DELETE FROM user_confirmation_codes');
    await db_client.query('DELETE FROM users');
  });

  test('should validate the code field', async ({ page }) => {
    await page.goto(`/pages/confirm-code?email=${user.email}`);

    const invalid_code = faker.string.numeric(3);

    const code_input = page.getByTestId('code');
    await code_input.fill(invalid_code);
    await code_input.blur();

    const code_error_message = page.getByTestId('code-error-messages').first();

    await expect(code_error_message).toContainText('O texto precisa ter pelo menos 4 caracteres.');
  });

  test('should not allow the user to go to /pages/confirm-code if captcha failed', async ({ page }) => {
    await page.goto(`/pages/confirm-code?email=${user.email}`);

    await page.route('*/**/api/auth/captcha', async (route) => {
      await route.fulfill({ status: 403 });
    });

    const code_input = page.getByTestId('code');
    await code_input.fill(faker.string.numeric(4));

    const email_input = page.getByTestId('email');
    const email_value = await email_input.inputValue();

    const submit_button = page.getByTestId('confirm-code-submit');
    await submit_button.click();

    expect(email_value).toEqual(user.email);
    expect(page).toHaveURL(`/pages/confirm-code?email=${user.email}`);
  });

  test("should alert the user if code doesn't exist", async ({ page, baseURL }) => {
    await page.goto(`/pages/confirm-code?email=${user.email}`);

    const code_input = page.getByTestId('code');
    await code_input.fill(faker.string.numeric(4));

    const email_input = page.getByTestId('email');
    const email_value = await email_input.inputValue();

    const submit_button = page.getByTestId('confirm-code-submit');
    await submit_button.click();

    await page.waitForResponse(`${baseURL}/forms/confirm-code`);

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(email_value).toEqual(user.email);
    expect(text).toBe('Código não encontrado.');
  });

  test('should alert the user if code has expired', async ({ page, baseURL }) => {
    await page.goto(`/pages/confirm-code?email=${user.email}`);

    const code_input = page.getByTestId('code');
    await code_input.fill(confirmation_code);

    const email_input = page.getByTestId('email');
    const email_value = await email_input.inputValue();

    const submit_button = page.getByTestId('confirm-code-submit');
    await submit_button.click();

    await page.waitForResponse(`${baseURL}/forms/confirm-code`);

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(email_value).toEqual(user.email);
    expect(text).toBe(`Este código ${confirmation_code} está expirado.`);
  });

  test("should redirect user to /pages/login if query param doesn't have email", async ({ page }) => {
    await page.goto('/pages/confirm-code');

    expect(page).toHaveURL('/pages/login');
  });
});
