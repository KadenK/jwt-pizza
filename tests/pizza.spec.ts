import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright/test";

const authTokenDiner =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6InBpenphIGRpbmVyIiwiZW1haWwiOiJkQGp3dC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn1dLCJpYXQiOjE3NTk4OTUwOTF9._JFyGDmi7UZsPu_jHUW2w4L5rgItJ115IknY6AcSUCk ";
const bearerTokenDiner = "Bearer " + authTokenDiner;

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
  await page.route("**/api/auth", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        message: "User registered successfully",
        user: {
          name: "Test User",
          email: "test@jwt.com",
        },
        token: "mocked-jwt-token",
      }),
    });
  });
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
  await page.route("**/api/auth", async (route, request) => {
    if (
      request.method() === "PUT" &&
      (await request.postDataJSON()).email === "d@jwt.com" &&
      (await request.postDataJSON()).password === "diner"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: 2,
            name: "pizza diner",
            email: "d@jwt.com",
            roles: [
              {
                role: "diner",
              },
            ],
          },
          token: authTokenDiner,
        }),
      });
    } else {
      await route.continue();
    }
  });
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("pd");
}

async function mockMenu(page: Page) {
  await page.route("**/api/order/menu", async (route, request) => {
    if (
      request.method() === "GET" &&
      request.headers()["authorization"] === "Bearer mocked-jwt-token-diner"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 1,
            title: "Veggie",
            image: "pizza1.png",
            price: 0.0038,
            description: "A garden of delight",
          },
          {
            id: 2,
            title: "Pepperoni",
            image: "pizza2.png",
            price: 0.0042,
            description: "Spicy treat",
          },
          {
            id: 3,
            title: "Margarita",
            image: "pizza3.png",
            price: 0.0042,
            description: "Essential classic",
          },
          {
            id: 4,
            title: "Crusty",
            image: "pizza4.png",
            price: 0.0028,
            description: "A dry mouthed favorite",
          },
          {
            id: 5,
            title: "Charred Leopard",
            image: "pizza5.png",
            price: 0.0099,
            description: "For those with a darker side",
          },
        ]),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/franchise*", async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          franchises: [
            {
              id: "1",
              name: "pizzaPocket",
              stores: [
                {
                  id: "1",
                  name: "SLC",
                },
              ],
            },
            {
              id: "2",
              name: "testing",
              stores: [],
            },
          ],
          more: false,
        }),
      });
    } else {
      await route.continue();
    }
  });
}

// Tests using the shared d@jwt.com account - run serially to avoid conflicts
test.describe.serial("diner user tests", () => {
  test("sign in a user", async ({ page }) => {
    await page.goto("/");
    await signInDiner(page);
  });

  test("sign out of a user", async ({ page }) => {
    await page.goto("/");
    await signInDiner(page);
    await page.route("**/api/auth", async (route, request) => {
      if (
        request.method() === "DELETE" &&
        request.headers()["authorization"] === "Bearer mocked-jwt-token-diner"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Logout successful" }),
        });
      } else {
        await route.continue();
      }
    });
    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page.locator("#navbar-dark")).toContainText("Login");
    await expect(page.locator("#navbar-dark")).toContainText("Register");
  });

  test("diner dashboard", async ({ page }) => {
    await page.goto("/");
    await signInDiner(page);

    await page.route("**/api/order", async (route, request) => {
      if (
        request.method() === "GET" &&
        request.headers()["authorization"] === "Bearer mocked-jwt-token-diner"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: 1,
              items: [
                { name: "Veggie A", quantity: 1 },
                { name: "Pepperoni", quantity: 2 },
              ],
              total: 3,
              user: "pizza diner",
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("link", { name: "pd" }).click();
    await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
    await expect(page.getByRole("main")).toContainText("pizza diner");
  });

  test("sign in and order", async ({ page }) => {
    await page.goto("/");
    await signInDiner(page);

    await mockMenu(page);

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

    await page.route("**/api/user/me", async (route, request) => {
      if (
        request.method() === "GET" &&
        request.headers()["authorization"] === bearerTokenDiner
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: 2,
            name: "pizza diner",
            email: "d@jwt.com",
            roles: [
              {
                role: "diner",
              },
            ],
            iat: 1759895091,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/api/order", async (route, request) => {
      if (
        request.method() === "POST" &&
        request.headers()["authorization"] === bearerTokenDiner
      ) {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            order: {
              items: [
                {
                  menuId: 1,
                  description: "Veggie",
                  price: 0.0038,
                },
                {
                  menuId: 2,
                  description: "Pepperoni",
                  price: 0.0042,
                },
                {
                  menuId: 3,
                  description: "Margarita",
                  price: 0.0042,
                },
              ],
              storeId: "1",
              franchiseId: "1",
              id: 21,
            },
            jwt: bearerTokenDiner,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByRole("heading")).toContainText("So worth it");
    await page.getByRole("button", { name: "Pay now" }).click();
    await expect(page.getByRole("heading")).toContainText(
      "Here is your JWT Pizza!"
    );
  });
});
