import { test as setup, expect } from '@playwright/test';
import { TEST_ACCOUNTS, ROUTES } from './fixtures/test-data';
import path from 'path';

const authFile = (role: string) => path.resolve('playwright/.auth', `${role}.json`);

setup('authenticate as customer', async ({ page }) => {
  await page.goto(ROUTES.LOGIN);
  await page.locator('input[name="email"]').fill(TEST_ACCOUNTS.customer.email);
  await page.locator('input[name="password"]').fill(TEST_ACCOUNTS.customer.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Wait for navigation or successful login indicator
  await expect(page).toHaveURL(/.*homepage|.*dashboard/);
  await page.context().storageState({ path: authFile('customer') });
});

setup('authenticate as provider', async ({ page }) => {
  await page.goto(ROUTES.LOGIN);
  await page.locator('input[name="email"]').fill(TEST_ACCOUNTS.provider.email);
  await page.locator('input[name="password"]').fill(TEST_ACCOUNTS.provider.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await expect(page).toHaveURL(/.*dashboard/);
  await page.context().storageState({ path: authFile('provider') });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto(ROUTES.LOGIN);
  await page.locator('input[name="email"]').fill(TEST_ACCOUNTS.admin.email);
  await page.locator('input[name="password"]').fill(TEST_ACCOUNTS.admin.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await expect(page).toHaveURL(/.*admin/);
  await page.context().storageState({ path: authFile('admin') });
});
