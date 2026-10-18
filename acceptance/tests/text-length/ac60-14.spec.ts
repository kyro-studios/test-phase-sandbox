import { expect, test } from '@playwright/test';

test('文字数の表示の後に文を書き換えて数えると、新しい文字数で置き換わる', { tag: '@AC60-14' }, async ({ page }) => {
  await page.goto('/text-length');
  const input = page.getByRole('textbox', { name: '文', exact: true });
  await input.fill('あいう');
  await page.getByRole('button', { name: '数える' }).click();
  await expect(page.getByRole('status')).toHaveText('3 文字');

  await input.fill('あいうえお');
  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('status')).toHaveText('5 文字');
  await expect(page.getByText('3 文字')).toHaveCount(0);
});
