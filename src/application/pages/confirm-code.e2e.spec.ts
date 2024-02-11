import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Confirm Code Page', () => {
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

  test("should redirect user to /pages/login if query param doesn't have email", async ({ page }) => {
    await page.goto('/pages/confirm-code');

    expect(page).toHaveURL('/pages/login');
  });
});
