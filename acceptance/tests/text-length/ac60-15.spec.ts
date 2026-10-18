import { expect, test } from '@playwright/test';

test('API に接続できないと、文字数を取得できませんでしたを表示する', { tag: '@AC60-15' }, async ({ page }) => {
  // 文字数の API への要求を、接続の失敗にする (サーバーが停止している状態に相当する)
  await page.route('**/api/text-length', (route) => route.abort('connectionrefused'));
  await page.goto('/text-length');

  await page.getByRole('textbox', { name: '文', exact: true }).fill('あいう');
  await page.getByRole('button', { name: '数える' }).click();

  await expect(page.getByRole('alert')).toHaveText('文字数を取得できませんでした');
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByText(/文を入力してください|200 文字以内で入力してください/)).toHaveCount(0);
});
