import { expect, test } from '@playwright/test';

test('名前を送ると、挨拶の文を JSON で返す', { tag: '@AC42-1' }, async ({ request }) => {
  const response = await request.post('/api/greeting', { data: { name: '山田' } });

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ greeting: 'こんにちは、山田 さん' });
});
