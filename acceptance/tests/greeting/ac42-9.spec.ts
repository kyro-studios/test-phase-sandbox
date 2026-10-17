import { expect, test } from '@playwright/test';

test('名前を入力して挨拶するを押すと、挨拶を表示する', { tag: '@AC42-9' }, async ({ page }) => {
  await page.goto('/greeting');

  await page.getByRole('textbox', { name: '名前', exact: true }).fill('山田');
  await page.getByRole('button', { name: '挨拶する' }).click();

  await expect(page.getByText('こんにちは、山田 さん')).toBeVisible();
  await expect(page.getByText(/名前を入力してください|20 文字以内|挨拶を取得できませんでした/)).toHaveCount(0);
});
