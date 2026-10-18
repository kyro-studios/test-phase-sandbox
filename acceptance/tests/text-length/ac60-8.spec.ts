import { expect, test } from '@playwright/test';

test('絵文字 200 個は、UTF-16 の単位ではなく 200 文字として受け付ける', { tag: '@AC60-8' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: '😀'.repeat(200) } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ length: 200 });
});
