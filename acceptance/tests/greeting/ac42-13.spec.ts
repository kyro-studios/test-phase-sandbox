import { expect, test } from '@playwright/test';

test('API に接続できないと、挨拶を取得できませんでしたを表示する', { tag: '@AC42-13' }, async ({ page }) => {
  // 挨拶の API への要求を、接続の失敗にする (サーバーが停止している状態に相当する)
  await page.route('**/api/greeting', (route) => route.abort('connectionrefused'));
  await page.goto('/greeting');

  await page.getByRole('textbox', { name: '名前', exact: true }).fill('山田');
  await page.getByRole('button', { name: '挨拶する' }).click();

  await expect(page.getByText('挨拶を取得できませんでした')).toBeVisible();
  await expect(page.getByText(/こんにちは|名前を入力してください|20 文字以内/)).toHaveCount(0);
});
