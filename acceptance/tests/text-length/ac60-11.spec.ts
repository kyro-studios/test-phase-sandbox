import { expect, test } from '@playwright/test';

test('あいうを入力して数えるを押すと、3 文字を表示する', { tag: '@AC60-11' }, async ({ page }) => {
  await page.goto('/text-length');

  await page.getByRole('textbox', { name: '文', exact: true }).fill('あいう');
  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('status')).toHaveText('3 文字');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
