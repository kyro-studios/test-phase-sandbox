import { expect, test } from '@playwright/test';

test('空白だけの名前は、空の誤りを返す', { tag: '@AC42-3' }, async ({ request }) => {
  // 全角スペース 1 つと半角スペース 2 つ
  const response = await request.post('/api/greeting', { data: { name: '　  ' } });

  expect(response.status()).toBe(400);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ error: '名前を入力してください' });
});
