import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  const user = JSON.parse(process.env.USER_TEST || '{}');

  test('should validate the email field', async ({ page }) => {
    await page.goto('/pages/forgot-password');

    const invalid_email = faker.string.alphanumeric();

    const email_input = page.getByTestId('forgot-password-email');
    await email_input.fill(invalid_email);
    await email_input.blur();

    const email_error_message = page.getByTestId('email-error-messages').first();

    await expect(email_error_message).toContainText('O campo precisa ser um e-mail válido.');
  });

  test('should not allow the user to continue if captcha failed', async ({ page }) => {
    await page.goto('/pages/forgot-password');

    await page.route('*/**/api/auth/captcha', async (route) => {
      await route.fulfill({ status: 403 });
    });

    const email_input = page.getByTestId('forgot-password-email');
    await email_input.fill(faker.internet.email());

    const submit_button = page.getByTestId('forgot-password-submit');
    await submit_button.click();

    expect(page).toHaveURL('/pages/forgot-password');
  });

  test('should alert the user if the forgot password email has been sent', async ({ page, baseURL }) => {
    await page.goto('/pages/forgot-password');

    const email_input = page.getByTestId('forgot-password-email');
    await email_input.fill(user.email);

    const submit_button = page.getByTestId('forgot-password-submit');
    await submit_button.click();

    await page.waitForResponse(`${baseURL}/forms/forgot-password`);

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(text).toEqual('Por favor verifique seu e-mail. Caso não tenha recebido tente novamente.')
  });

  test("should alert the user if the email doesn't exist", async ({ page, baseURL }) => {
    await page.goto('/pages/forgot-password');

    const email_input = page.getByTestId('forgot-password-email');
    await email_input.fill(faker.internet.email());

    const submit_button = page.getByTestId('forgot-password-submit');
    await submit_button.click();

    await page.waitForResponse(`${baseURL}/forms/forgot-password`);

    const alert_message = page.getByTestId('alert-message');
    const text = await alert_message.innerText();

    expect(text).toEqual('Não foi encontrado nenhum usuário com esse endereço de e-mail.');
  });
});
