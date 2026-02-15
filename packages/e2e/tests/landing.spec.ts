import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page.locator('h1')).toContainText('Nuxt Boilerplate');

    // Check buttons are present
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Check feature cards
    await expect(page.getByText('Auth Ready')).toBeVisible();
    await expect(page.getByText('UI Components')).toBeVisible();
    await expect(page.getByText('Email Built-in')).toBeVisible();
  });

  test('should navigate to register page when clicking Get Started', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Get Started' }).click();

    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Create an account');
  });

  test('should navigate to login page when clicking Sign In', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });
});
