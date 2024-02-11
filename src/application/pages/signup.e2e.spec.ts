import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Signup Page', () => {
  let user_id = '';
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
  });

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/users/${user_id}`);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/signup');
  });

  test('should validate the email field', async ({ page }) => {
    const invalid_email = faker.string.alphanumeric();

    const email_input = page.getByTestId('signup-email');
    await email_input.fill(invalid_email);
    await email_input.blur();

    const email_error_message = page.getByTestId('email-error-messages').first();

    await expect(email_error_message).toContainText('O campo precisa ser um e-mail válido.');
  });

  test('should have password length greater than 8 caracters', async ({ page }) => {
    const invalid_password = faker.string.alphanumeric(6);

    const password_input = page.getByTestId('signup-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O texto precisa ter pelo menos 8 caracteres.');
  });

  test('should have password with numbers, letters and 1 special caracter', async ({ page }) => {
    const invalid_password = faker.string.numeric(10);
    console.log(invalid_password);

    const password_input = page.getByTestId('signup-password');
    await password_input.fill(invalid_password);
    await password_input.blur();

    const password_error_message = page.getByTestId('password-error-messages').first();
    await expect(password_error_message).toContainText('O campo precisa ter letras, números e algum caracter especial.');
  });

  test('should validate the name field', async ({ page }) => {
    const invalid_name = faker.number.int().toString();

    const name_input = page.getByTestId('signup-name');
    await name_input.fill(invalid_name);
    await name_input.blur();

    const name_error_message = page.getByTestId('name-error-messages').first();

    await expect(name_error_message).toContainText('O campo precisa ser um texto válido.');
  });

  test('should validate the phone_number field', async ({ page }) => {
    const invalid_phone_number = faker.string.numeric(10);

    const phone_input = page.getByTestId('signup-phone-number');
    await phone_input.fill(invalid_phone_number);
    await phone_input.blur();

    const phone_number_error_message = page.getByTestId('phone-number-error-messages').first();

    await expect(phone_number_error_message).toContainText('O campo precisa ser um telefone válido.');
  });

  test('should not allow the user to go to /pages/index if captcha failed', async ({ page }) => {
    await page.route('*/**/api/auth/captcha', async (route) => {
      await route.fulfill({ status: 403 });
    });

    const name_input = page.getByTestId('signup-name');
    await name_input.fill(faker.person.fullName());

    const email_input = page.getByTestId('signup-email');
    await email_input.fill(faker.internet.email());

    const phone_input = page.getByTestId('signup-phone-number');
    await phone_input.fill(faker.string.numeric(11));

    const password_input = page.getByTestId('signup-password');
    await password_input.fill(`${faker.string.alphanumeric()}!@#$%`);

    const submit_button = page.getByTestId('signup-submit');
    await submit_button.click();

    expect(page).toHaveURL('/pages/signup');
  });

  test('should redirect the user to /pages/login if captcha succeed', async ({ page }) => {
    const name_input = page.getByTestId('signup-name');
    await name_input.fill(faker.person.fullName());

    const email_input = page.getByTestId('signup-email');
    await email_input.fill(faker.internet.email());

    const phone_input = page.getByTestId('signup-phone-number');
    await phone_input.fill(faker.string.numeric(11));

    const password_input = page.getByTestId('signup-password');
    await password_input.fill(`${faker.string.alphanumeric(10)}!@#$%`);

    const submit_button = page.getByTestId('signup-submit');
    await submit_button.click();
    await page.waitForURL('**/pages/confirm-code');

    expect(page).toHaveURL('/pages/confirm-code');
  });

  test('should not register the same email twice', async ({ page, baseURL }) => {
    const name_input = page.getByTestId('signup-name');
    await name_input.fill(user.name);

    const email_input = page.getByTestId('signup-email');
    await email_input.fill(user.email);

    const phone_input = page.getByTestId('signup-phone-number');
    await phone_input.fill(user.phone_number);

    const password_input = page.getByTestId('signup-password');
    await password_input.fill(user.password);

    const submit_button = page.getByTestId('signup-submit');
    await submit_button.click();

    await page.waitForResponse(`${baseURL}/forms/signup`);

    const alert_message = page.getByTestId('alert-message');

    const text = await alert_message.innerText();
    expect(text).toBe('Endereço de e-mail já cadastrado.');
  });
});
