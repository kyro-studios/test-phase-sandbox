import { expect, test } from '@playwright/test';

test('半角スペースだけの文は空とみなさず、空白の数を文字数とする', { tag: '@AC60-4' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: '   ' } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ length: 3 });
});
