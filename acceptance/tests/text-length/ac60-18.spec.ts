import { expect, test } from '@playwright/test';

test('文を入力してくださいの表示の後に文を書き換えて数えると、文字数を表示し、誤りは消える', { tag: '@AC60-18' }, async ({ page }) => {
  await page.goto('/text-length');
  const input = page.getByRole('textbox', { name: '文', exact: true });
  await page.getByRole('button', { name: '数える' }).click();
  await expect(page.getByRole('alert')).toHaveText('文を入力してください');

  await input.fill('あいう');
  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('status')).toHaveText('3 文字');
  await expect(page.getByText('文を入力してください')).toHaveCount(0);
});
