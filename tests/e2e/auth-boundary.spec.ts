import { expect, test } from "@playwright/test";

test("login screen renders the primary authentication controls", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto("/login");

  await expect(page).toHaveTitle(/ログイン.*Life Inventory/);
  await expect(
    page.getByRole("heading", { name: "今の暮らしを見渡す" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Googleで続ける" }),
  ).toBeVisible();
  await expect(
    page.getByText("Gmailの内容にはアクセスしません。", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test("anonymous visitors cannot enter the authenticated app", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("button", { name: "Googleで続ける" }),
  ).toBeVisible();
});
