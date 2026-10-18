import { expect, test } from '@playwright/test';

test('前後の半角スペースを除かずに数える', { tag: '@AC60-3' }, async ({ request }) => {
  const response = await request.post('/api/text-length', { data: { text: ' あ ' } });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ length: 3 });
});
