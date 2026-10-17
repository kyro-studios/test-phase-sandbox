import { expect, test } from '@playwright/test';

test('何も入力していない挨拶の画面は、空の入力欄とボタンだけを表示する', { tag: '@AC42-7' }, async ({ page }) => {
  await page.goto('/greeting');

  await expect(page.getByRole('textbox', { name: '名前', exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: '挨拶する' })).toBeVisible();
  await expect(page.getByText(/こんにちは|名前を入力してください|20 文字以内|挨拶を取得できませんでした/)).toHaveCount(0);
});
