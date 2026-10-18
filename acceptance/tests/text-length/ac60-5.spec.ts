import { expect, test } from '@playwright/test';

test('空の文は、空の誤りを返す', { tag: '@AC60-5' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: '' } });

  expect(response.status()).toBe(400);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ error: '文を入力してください' });
});
