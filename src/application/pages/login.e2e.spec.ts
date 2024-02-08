import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/login');
  });

  test('should validate the email field', async ({ page }) => {
    const invalid_email = faker.string.alphanumeric();

    const email_input = page.getByTestId('login-email');
    await email_input.fill(invalid_email);
    await email_input.blur();

    const email_error_message = page.getByTestId('email-error-messages').first();

    await expect(email_error_message).toContainText('O campo precisa ser um e-mail válido.');
  });

  test('should have password length greater than 8 caracters', async ({ page }) => {
    const invalid_password = faker.string.alphanumeric(6);

    const password_input = page.getByTestId('login-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O texto precisa ter pelo menos 8 caracteres.');
  });

  test('should have password with numbers, letters and 1 special caracter', async ({ page }) => {
    const invalid_password = faker.string.numeric(10);
    console.log(invalid_password);

    const password_input = page.getByTestId('login-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O campo precisa ter letras, números e algum caracter especial.');
  });
});
