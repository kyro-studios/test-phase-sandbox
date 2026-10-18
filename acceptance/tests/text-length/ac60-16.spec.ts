import { expect, test } from '@playwright/test';

test('文字数の表示の後に画面を開き直すと、結果は残らず、入力欄は空になる', { tag: '@AC60-16' }, async ({ context, page }) => {
  await page.goto('/text-length');
  await page.getByRole('textbox', { name: '文', exact: true }).fill('あいう');
  await page.getByRole('button', { name: '数える' }).click();
  await expect(page.getByRole('status')).toHaveText('3 文字');

  // 同じブラウザー (同じ context) で、新しいタブから開き直す
  const reopened = await context.newPage();
  await reopened.goto('/text-length');

  await expect(reopened.getByRole('textbox', { name: '文', exact: true })).toHaveValue('');
  await expect(reopened.getByRole('status')).toHaveCount(0);
  await expect(reopened.getByRole('alert')).toHaveCount(0);
});
