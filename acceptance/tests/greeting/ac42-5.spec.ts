import { expect, test } from '@playwright/test';

test('前後の空白を除いて 20 文字の名前は受け付ける', { tag: '@AC42-5' }, async ({ request }) => {
  // 前後に半角スペースを 3 個ずつ付けた a を 20 個 (除くと 20 文字)
  const name = `   ${'a'.repeat(20)}   `;
  const response = await request.post('/api/greeting', { data: { name } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ greeting: `こんにちは、${'a'.repeat(20)} さん` });
});
