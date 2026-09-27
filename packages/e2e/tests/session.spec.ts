import { test, expect } from '@playwright/test';

// Exercises the real credentials flow end to end: register through the API,
// then sign in through the UI. This is the path that breaks if the
// next-auth/core patch stops applying.
test.describe('Session', () => {
  const password = 'Password123!';
  let email: string;

  test.beforeEach(async ({ request }, testInfo) => {
    email = `e2e-${Date.now()}-${testInfo.retry}@example.com`;
    const response = await request.post('/api/register', {
      data: { email, password, name: 'E2E User' },
    });
    expect(response.status()).toBe(200);
  });

  test('signs in with valid credentials and reaches the dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back!' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('rejects a wrong password', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('not-the-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('redirects an anonymous visitor away from the dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/auth/login');
  });
});
