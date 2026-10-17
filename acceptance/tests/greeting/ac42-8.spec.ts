import { expect, test } from '@playwright/test';

test('名前の入力欄を「名前」で探し、山田と入力できる', { tag: '@AC42-8' }, async ({ page }) => {
  await page.goto('/greeting');

  const input = page.getByRole('textbox', { name: '名前', exact: true });
  await input.fill('山田');

  await expect(input).toHaveValue('山田');
});
