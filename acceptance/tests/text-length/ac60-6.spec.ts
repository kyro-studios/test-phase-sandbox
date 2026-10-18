import { expect, test } from '@playwright/test';

test('201 文字の文は、長すぎる誤りを返す', { tag: '@AC60-6' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: 'a'.repeat(201) } });

  expect(response.status()).toBe(400);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ error: '文は 200 文字以内で入力してください' });
});
