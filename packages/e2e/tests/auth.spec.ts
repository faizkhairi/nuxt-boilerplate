import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.locator('h1')).toContainText('Create an account');
      await expect(page.getByLabel('Name')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    });

    test('should show validation error for password mismatch', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password456');

      await page.getByRole('button', { name: 'Create account' }).click();

      await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('pass');
      await page.getByLabel('Confirm Password').fill('pass');

      await page.getByRole('button', { name: 'Create account' }).click();

      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/auth/register');

      const loginLink = page.getByRole('link', { name: 'Sign in' });
      await expect(loginLink).toBeVisible();

      await loginLink.click();
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Login', () => {
    test('should show login form', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.locator('h1')).toContainText('Welcome back');
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('should show OAuth buttons', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    });

    test('should have link to register page', async ({ page }) => {
      await page.goto('/auth/login');

      const registerLink = page.getByRole('link', { name: 'Sign up' });
      await expect(registerLink).toBeVisible();

      await registerLink.click();
      await expect(page).toHaveURL('/auth/register');
    });

    test('should have link to forgot password page', async ({ page }) => {
      await page.goto('/auth/login');

      const forgotLink = page.getByRole('link', { name: 'Forgot your password?' });
      await expect(forgotLink).toBeVisible();

      await forgotLink.click();
      await expect(page).toHaveURL('/auth/forgot-password');
    });
  });

  test.describe('Forgot Password', () => {
    test('should show forgot password form', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      await expect(page.locator('h1')).toContainText('Reset your password');
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
    });

    test('should have link back to login', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      const backLink = page.getByRole('link', { name: 'Back to login' });
      await expect(backLink).toBeVisible();

      await backLink.click();
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Navigation', () => {
    test('should allow navigation between auth pages', async ({ page }) => {
      // Start at login
      await page.goto('/auth/login');
      await expect(page.locator('h1')).toContainText('Welcome back');

      // Navigate to register
      await page.getByRole('link', { name: 'Sign up' }).click();
      await expect(page).toHaveURL('/auth/register');
      await expect(page.locator('h1')).toContainText('Create an account');

      // Navigate back to login
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/auth/login');

      // Navigate to forgot password
      await page.getByRole('link', { name: 'Forgot your password?' }).click();
      await expect(page).toHaveURL('/auth/forgot-password');

      // Navigate back to login
      await page.getByRole('link', { name: 'Back to login' }).click();
      await expect(page).toHaveURL('/auth/login');
    });
  });
});
