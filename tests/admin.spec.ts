import { test, expect } from "playwright-test-coverage";

test("listUsers", async ({ page }) => {
  // Register a new user
  const name = Math.floor(Math.random() * 10000).toString();
  const email = `user${name}@jwt.com`;
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(name);
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: "Logout" }).click();

  // Login as admin
  await loginAdmin(page);
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("heading", { name: "Users" }).click();

  // Ensure self exists
  await expect(page.locator("tbody")).toContainText("常用名字");
  await expect(page.locator("tbody")).toContainText("a@jwt.com");
  await expect(page.locator("tbody")).toContainText("admin");

  // Ensure new user exists
  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).fill(name);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("tbody")).toContainText(name);
  await expect(page.locator("tbody")).toContainText(email);
  await expect(page.locator("tbody")).toContainText("diner");

  // Ensure user deletion works
  await page
    .getByRole("row", { name: `${name} ${email}` })
    .getByRole("button")
    .click();
  await expect(page.locator("tbody")).not.toContainText(email);

  // Refresh and ensure user still doesn't exist
  await page.reload();
  await page.getByRole("heading", { name: "Users" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).fill(name);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("tbody")).not.toContainText(email);
});

async function loginAdmin(page: any) {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
}
