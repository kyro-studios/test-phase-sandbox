import { expect, test } from '@playwright/test';

test('201 文字の文で数えるを押すと、200 文字以内の誤りを表示し、入力欄の値は残る', { tag: '@AC60-13' }, async ({ page }) => {
  await page.goto('/text-length');
  const longText = 'a'.repeat(201);

  const input = page.getByRole('textbox', { name: '文', exact: true });
  await input.fill(longText);
  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('alert')).toHaveText('文は 200 文字以内で入力してください');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(input).toHaveValue(longText);
});
