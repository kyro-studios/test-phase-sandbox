import { expect, test } from '@playwright/test';

test('文字数の画面の下部に、年の入った著作権の表記を表示する', { tag: '@AC60-17' }, async ({ page }) => {
  await page.goto('/text-length');
  const year = new Date().getFullYear();

  const footer = page.getByRole('contentinfo');
  await expect(footer).toHaveText(`© ${year} Kyro Studios`);

  // フッターは、文の入力欄より下にある
  const input = await page.getByRole('textbox', { name: '文', exact: true }).boundingBox();
  const box = await footer.boundingBox();
  expect(box!.y).toBeGreaterThan(input!.y);
});
