import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';
import Postgres from '@shared/Postgres';

test.describe('Reset Password Page', () => {
  const db_client = Postgres.getClient();
  const user_id = faker.string.uuid();

  test.beforeAll(async () => {
    await db_client.connect();

    await db_client.query(
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

  test('should password has length greater than 8 caracters', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${faker.string.uuid()}`);

    const invalid_password = faker.string.alphanumeric(6);

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O texto precisa ter pelo menos 8 caracteres.');
  });

  test('should password has numbers, letters and 1 special caracter', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${faker.string.uuid()}`);

    const invalid_password = faker.string.numeric(10);

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O campo precisa ter letras, números e algum caracter especial.');
  });

  test('should confirm_password has length greater than 8 caracters', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${faker.string.uuid()}`);

    const invalid_password = faker.string.alphanumeric(6);

    const confirm_password_input = page.getByTestId('reset-password-confirm-password');
    await confirm_password_input.fill(invalid_password);
    await confirm_password_input.blur();

    const password_error_message = page.getByTestId('confirm-password-error-messages').last();
    await expect(password_error_message).toContainText('O texto precisa ter pelo menos 8 caracteres.');
  });

  test('should confirm_password has numbers, letters and 1 special caracter', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${faker.string.uuid()}`);

    const invalid_password = faker.string.numeric(10);

    const confirm_password_input = page.getByTestId('reset-password-confirm-password');
    await confirm_password_input.fill(invalid_password);
    await confirm_password_input.blur();

    const confirm_password_error_messages = page.locator('ul[data-testid="confirm-password-error-messages"] > li');
    const text = await confirm_password_error_messages.first().innerText();
    console.log(text);
    expect(text).toEqual('O campo precisa ter letras, números e algum caracter especial.');
  });

  test('should validate if password and confirm_password are equals', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${faker.string.uuid()}`);

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(`${faker.string.alphanumeric(10)}!@#$`);

    const confirm_password_input = page.getByTestId('reset-password-confirm-password');
    await confirm_password_input.fill(`${faker.string.alphanumeric(10)}!@#$`);
    await confirm_password_input.blur();

    const password_error_message = page.getByTestId('confirm-password-error-messages').first();
    await expect(password_error_message).toContainText('O campo não é igual ao outro.');
  });

  test("should redirect user to /pages/login if query param doesn't have user_id", async ({ page, baseURL }) => {
    await page.goto('/pages/reset-password');

    expect(page).toHaveURL('/pages/login');
  });

  test('should redirect user to /pages/login if password has been reseted', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${user_id}`);

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(`${faker.string.alphanumeric(10)}!@#$`);

    const confirm_password_input = page.getByTestId('reset-password-confirm-password');
    await confirm_password_input.fill(`${faker.string.alphanumeric(10)}!@#$`);

    const submit_button = page.getByTestId('login-submit');
    await submit_button.click();
    await page.waitForURL('**/pages/login');

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(page).toHaveURL('/pages/login');
    expect(text).toEqual('Senha redefinida com sucesso.');
  });
});
