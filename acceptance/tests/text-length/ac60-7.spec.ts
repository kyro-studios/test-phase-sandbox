import { expect, test } from '@playwright/test';

test('ちょうど 200 文字の文は受け付ける', { tag: '@AC60-7' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: 'a'.repeat(200) } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ length: 200 });
});
