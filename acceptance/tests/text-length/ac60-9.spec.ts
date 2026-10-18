import { expect, test } from '@playwright/test';

test('文字数の画面を開くと、空の入力欄と数えるボタンを表示し、結果は表示しない', { tag: '@AC60-9' }, async ({ page }) => {
  await page.goto('/text-length');

  await expect(page.getByRole('textbox', { name: '文', exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: '数える' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
