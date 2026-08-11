import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error("Playwright config did not provide Supabase credentials.");
}

test.describe("authenticated MVP flow", () => {
  test.skip(({ isMobile }) => Boolean(isMobile), "Covered on desktop once.");

  const email = `e2e-${randomUUID()}@example.com`;
  const password = `Test-${randomUUID()}-9!`;

  test.beforeAll(async () => {
    const client = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.auth.signUp({ email, password });
    expect(error).toBeNull();
  });

  test("completes the authenticated MVP workflow", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.goto("/login");
    await page.locator("#sign-in-email").fill(email);
    await page.locator("#sign-in-password").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/items/new");
    await page.getByLabel("Item Name").fill("Review loop regression item");
    await page.getByLabel("Quantity").fill("2");
    await page.getByText("+ Details").click();
    await page.getByLabel("Reviewに追加").check();
    await page.getByRole("button", { name: "Itemを追加" }).click();
    await expect(page).toHaveURL(/\/items\/[0-9a-f-]+$/);
    const itemUrl = page.url();

    await page.goto("/review");
    await expect(
      page.getByRole("heading", { name: "Review loop regression item" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "保留" }).click();
    await expect(page.getByText("Review Complete")).toBeVisible();

    await page.goto("/settings/categories");
    const newSubForm = page
      .locator("form")
      .filter({ has: page.getByPlaceholder("サブカテゴリを追加") })
      .first();
    await newSubForm.getByPlaceholder("サブカテゴリを追加").fill("Room");
    await newSubForm.getByRole("button", { name: "追加" }).click();
    await page.reload();

    const editSubForm = page
      .locator("form")
      .filter({ has: page.getByLabel("Roomの名前") });
    await editSubForm.getByLabel("Roomの名前").fill("Living Room");
    await editSubForm.getByRole("button", { name: "更新" }).click();
    await page.reload();
    await expect(page.getByLabel("Living Roomの名前")).toHaveValue(
      "Living Room",
    );

    await page.goto("/ideal");
    await page.getByText("+ Ideal Itemを追加").click();
    await page.locator("#ideal-name-new").fill("Review loop regression item");
    await page.locator("#ideal-quantity-new").fill("1");
    await page.getByRole("button", { name: "Idealを追加" }).click();
    await expect(
      page.getByRole("heading", { name: "Review loop regression item" }),
    ).toBeVisible();

    await page.goto("/expenses");
    await page.getByText("+ 固定費を追加").click();
    await page.locator("#expense-name-new").fill("Home internet");
    await page.locator("#expense-amount-new").fill("6000");
    await page.getByRole("button", { name: "固定費を追加" }).click();
    await expect(
      page.getByRole("heading", { name: "Home internet" }),
    ).toBeVisible();

    await page.goto(itemUrl);
    await page.getByText("Archiveする").click();
    await page.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(page).toHaveURL(/\/archive$/);
    await expect(page.getByText("Review loop regression item")).toBeVisible();

    expect(browserErrors).toEqual([]);
  });
});
