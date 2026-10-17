import { expect, test } from '@playwright/test';

test('絵文字 20 個の名前は、20 文字として受け付ける', { tag: '@AC42-6' }, async ({ request }) => {
  // コードポイントで 20 文字 (UTF-16 では 40 単位)
  const emoji = '😀'.repeat(20);
  const response = await request.post('/api/greeting', { data: { name: emoji } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ greeting: `こんにちは、${emoji} さん` });
});
