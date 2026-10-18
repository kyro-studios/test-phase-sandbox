import { expect, test } from '@playwright/test';

test('絵文字 1 個は、1 文字として数える', { tag: '@AC60-2' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: '😀' } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ length: 1 });
});
