import { expect, test } from '@playwright/test';

test('あいうを送ると、文字数の 3 を返す', { tag: '@AC60-1' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: 'あいう' } });

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.json()).toEqual({ length: 3 });
});
