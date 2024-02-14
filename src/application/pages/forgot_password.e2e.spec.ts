import { faker } from '@faker-js/faker/locale/pt_BR';
import { expect, test } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/forgot-password');
  });

  test('should validate the email field', async ({ page }) => {
    const invalid_email = faker.string.alphanumeric();

    const email_input = page.getByTestId('email-forgot-password');
    await email_input.fill(invalid_email);
    await email_input.blur();

    const email_error_message = page.getByTestId('email-error-messages').first();

    await expect(email_error_message).toContainText('O campo precisa ser um e-mail válido.');
  });

  test('should not allow the user to continue if captcha failed', async ({ page }) => {
    await page.route('*/**/api/auth/captcha', async (route) => {
      await route.fulfill({ status: 403 });
    });

    const code_input = page.getByTestId('forgot-password-email');
    await code_input.fill(faker.internet.email());

    const submit_button = page.getByTestId('forgot-password-submit');
    await submit_button.click();

    expect(page).toHaveURL('/pages/forgot-password');
  });

  test.skip("should redirect user to /pages/login if query param doesn't have email", async ({ page }) => {
    await page.goto('/pages/confirm-code');

    expect(page).toHaveURL('/pages/login');
  });
});
