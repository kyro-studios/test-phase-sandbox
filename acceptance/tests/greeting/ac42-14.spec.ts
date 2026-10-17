import { expect, test } from '@playwright/test';

test('挨拶の表示の後に画面を開き直すと、挨拶は残らず、入力欄は空になる', { tag: '@AC42-14' }, async ({ context, page }) => {
  await page.goto('/greeting');
  await page.getByRole('textbox', { name: '名前', exact: true }).fill('山田');
  await page.getByRole('button', { name: '挨拶する' }).click();
  await expect(page.getByText('こんにちは、山田 さん')).toBeVisible();

  // 同じブラウザー (同じ context) で、新しいタブから開き直す
  const reopened = await context.newPage();
  await reopened.goto('/greeting');

  await expect(reopened.getByRole('textbox', { name: '名前', exact: true })).toHaveValue('');
  await expect(reopened.getByText(/こんにちは|名前を入力してください|20 文字以内|挨拶を取得できませんでした/)).toHaveCount(0);
});
