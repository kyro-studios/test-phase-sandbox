import { expect, test } from '@playwright/test';

test('文の入力欄に、あいうを入力できる', { tag: '@AC60-10' }, async ({ page }) => {
  await page.goto('/text-length');

  const input = page.getByRole('textbox', { name: '文', exact: true });
  await input.fill('あいう');

  await expect(input).toHaveValue('あいう');
});
