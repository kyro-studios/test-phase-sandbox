import { expect, test } from '@playwright/test';

test('空の文で数えるを押すと、文を入力してくださいを表示する', { tag: '@AC60-12' }, async ({ page }) => {
  await page.goto('/text-length');

  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('alert')).toHaveText('文を入力してください');
  await expect(page.getByRole('status')).toHaveCount(0);
});
