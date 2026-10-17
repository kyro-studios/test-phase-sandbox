import { expect, test } from '@playwright/test';

test('空の名前で挨拶するを押すと、名前を入力してくださいの誤りを表示する', { tag: '@AC42-10' }, async ({ page }) => {
  await page.goto('/greeting');

  await page.getByRole('button', { name: '挨拶する' }).click();

  await expect(page.getByText('名前を入力してください')).toBeVisible();
  await expect(page.getByText('こんにちは')).toHaveCount(0);
});
