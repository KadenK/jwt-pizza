import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright/test";

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

test("not found", async ({ page }) => {
  await page.goto("/badpage");

  await expect(page.getByRole("heading")).toContainText("Oops");
  await expect(page.getByRole("list")).toContainText("homebadpage");
});

test("register a user", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("Test User");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("test@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("test");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("TU");
});

async function signInDiner(page: Page) {
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("pd");
}

// Tests using the shared d@jwt.com account - run serially to avoid conflicts
test.describe.serial("diner user tests", () => {
  test("sign in a user", async ({ page }) => {
    await page.goto("/");
    signInDiner(page);
  });

  test("sign out of a user", async ({ page }) => {
    await page.goto("/");
    signInDiner(page);
    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page.locator("#navbar-dark")).toContainText("Login");
    await expect(page.locator("#navbar-dark")).toContainText("Register");
  });

  test("diner dashboard", async ({ page }) => {
    await page.goto("/");
    signInDiner(page);

    await page.getByRole("link", { name: "pd" }).click();
    await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
    await expect(page.getByRole("main")).toContainText("pizza diner");
  });

  test("sign in and order", async ({ page }) => {
    await page.goto("/");
    signInDiner(page);

    await page.getByRole("button", { name: "Order now" }).click();
    await page.getByRole("combobox").selectOption("1");
    await page
      .getByRole("link", { name: "Image Description Veggie A" })
      .click();
    await page
      .getByRole("link", { name: "Image Description Pepperoni" })
      .click();
    await page
      .getByRole("link", { name: "Image Description Margarita" })
      .click();
    await expect(page.locator("form")).toContainText("Selected pizzas: 3");
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByRole("main")).toContainText("Pay now");
    await expect(page.locator("tfoot")).toContainText("3 pies");
    await page.getByRole("button", { name: "Pay now" }).click();
    await expect(page.getByRole("heading")).toContainText(
      "Here is your JWT Pizza!"
    );
  });
});
