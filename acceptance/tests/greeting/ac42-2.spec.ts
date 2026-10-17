import { expect, test } from '@playwright/test';

test('前後の空白を除き、間の半角スペースは残す', { tag: '@AC42-2' }, async ({ request }) => {
  // 全角スペース 1 つ、「山田 太郎」(間は半角スペース 1 つ)、タブ 1 つ
  const response = await request.post('/api/greeting', { data: { name: '　山田 太郎\t' } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ greeting: 'こんにちは、山田 太郎 さん' });
});
