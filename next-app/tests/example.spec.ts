import { test, expect } from '@playwright/test';

test('Test/v1/signIn', async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await page.getByPlaceholder(/example/i).fill('test1@gmail.com');
  await page.getByPlaceholder(/•••••••/i).fill('11223344');
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
});

test('test/v1/signUp', async ({ page }) => {
  await page.goto("http://localhost:3000/signup");

  await page.getByPlaceholder(/john/i).fill("test");
  await page.getByPlaceholder(/example/i).fill('test1@gmail.com');
  await page.getByPlaceholder(/•••••••/i).fill('11223344');

  const signUpButton = page.getByRole('button', { name: /Create Account/i });
  await expect(signUpButton).toBeVisible();
  await signUpButton.click();

  await expect(page).toHaveURL(/login/i, { timeout: 15000 });
});

test('test/v1/explore', async ({ page }) => {
  await page.goto("http://localhost:3000/explore");
  await expect(page).toHaveURL(/explore/i, { timeout: 15000 });
});