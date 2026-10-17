import { expect, test } from '@playwright/test';

test('挨拶の表示の後に空にして押すと、挨拶は消え、名前を入力してくださいの誤りを表示する', { tag: '@AC42-12' }, async ({ page }) => {
  await page.goto('/greeting');
  const input = page.getByRole('textbox', { name: '名前', exact: true });
  await input.fill('山田');
  await page.getByRole('button', { name: '挨拶する' }).click();
  await expect(page.getByText('こんにちは、山田 さん')).toBeVisible();

  await input.fill('');
  await page.getByRole('button', { name: '挨拶する' }).click();

  await expect(page.getByText('名前を入力してください')).toBeVisible();
  await expect(page.getByText('こんにちは、山田 さん')).toHaveCount(0);
});
