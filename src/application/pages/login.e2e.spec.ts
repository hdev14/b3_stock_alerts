import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Login Page', () => {
  const user = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.string.alphanumeric(10) + '!@#$',
    phone_number: faker.string.numeric(11),
  };

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/users', {
      data: user,
      headers: { 'Content-Type': 'application/json' }
    });

    expect(response.ok()).toBeTruthy();
  });

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

  test('should not allow the user to go to /pages/index if captcha failed', async ({ page }) => {
    await page.route('*/**/api/auth/captcha', async (route) => {
      await route.fulfill({ status: 403 });
    });

    const email_input = page.getByTestId('login-email');
    await email_input.fill(faker.internet.email())

    const password_input = page.getByTestId('login-password');
    await password_input.fill(faker.string.alphanumeric() + '!@#$%');

    const submit_button = page.getByTestId('login-submit');
    await submit_button.click();

    expect(page).toHaveURL('/pages/login');
  });

  test('should allow the user to go to /pages/index if captcha succeed', async ({ page }) => {
    const email_input = page.getByTestId('login-email');
    await email_input.fill(user.email)

    const password_input = page.getByTestId('login-password');
    await password_input.fill(user.password);

    const submit_button = page.getByTestId('login-submit');
    await submit_button.click();
    await page.waitForURL('**/pages/index');

    expect(page).toHaveURL('/pages/index')
  });
});
