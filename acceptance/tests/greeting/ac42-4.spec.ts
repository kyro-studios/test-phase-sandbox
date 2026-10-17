import { expect, test } from '@playwright/test';

test('21 文字の名前は、長すぎる誤りを返す', { tag: '@AC42-4' }, async ({ request }) => {
  const response = await request.post('/api/greeting', { data: { name: 'a'.repeat(21) } });

  expect(response.status()).toBe(400);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ error: '名前は 20 文字以内で入力してください' });
});
