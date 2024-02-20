import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Reset Password Page', () => {
  let user_id = '';

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: `${faker.string.alphanumeric(10)}!@#$`,
        phone_number: faker.string.numeric(11),
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    user_id = data.id;
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

  test("should redirect user to /pages/login if query param doesn't have user_id", async ({ page }) => {
    await page.goto('/pages/reset-password');

    expect(page).toHaveURL('/pages/login');
  });

  test('should redirect user to /pages/login if password has been reseted', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${user_id}`);
    const password = `${faker.string.alphanumeric(10)}!@#$`;

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(password);

    const confirm_password_input = page.getByTestId('reset-password-confirm-password');
    await confirm_password_input.fill(password);

    const submit_button = page.getByTestId('reset-password-submit');
    await submit_button.click();

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(page).toHaveTitle('Login!');
    expect(text).toEqual('Senha redefinida com sucesso.');
  });

  test('should disable submit button if the form has validation errors', async ({ page }) => {
    await page.goto(`/pages/reset-password?user_id=${user_id}`);

    const invalid_password = faker.string.alphanumeric(10);

    const password_input = page.getByTestId('reset-password-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const submit_button = page.getByTestId('reset-password-submit');
    const result = await submit_button.isDisabled();

    expect(result).toBeTruthy();
  });
});
