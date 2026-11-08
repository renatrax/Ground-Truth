import { expect, test } from '@playwright/test';

test('loads Python from our own origin in a worker and computes 2 + 2', async ({ page }) => {
  const pyodideRequests: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('pyodide')) pyodideRequests.push(req.url());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ground Truth' })).toBeVisible();
  await expect(page.getByTestId('engine-status')).toContainText('2 + 2 = 4', { timeout: 60_000 });

  // Every Pyodide file must come from the page's own origin.
  const origin = new URL(page.url()).origin;
  expect(pyodideRequests.length).toBeGreaterThan(0);
  for (const url of pyodideRequests) expect(new URL(url).origin).toBe(origin);
});
