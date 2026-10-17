import { expect, test } from '@playwright/test';

test('21 文字の名前で挨拶するを押すと、20 文字以内の誤りを表示し、入力は残る', { tag: '@AC42-11' }, async ({ page }) => {
  await page.goto('/greeting');

  const input = page.getByRole('textbox', { name: '名前', exact: true });
  await input.fill('a'.repeat(21));
  await page.getByRole('button', { name: '挨拶する' }).click();

  await expect(page.getByText('名前は 20 文字以内で入力してください')).toBeVisible();
  await expect(input).toHaveValue('a'.repeat(21));
  await expect(page.getByText('こんにちは')).toHaveCount(0);
});
