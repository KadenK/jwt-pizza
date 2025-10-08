import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright/test";

const authTokenDiner =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6InBpenphIGRpbmVyIiwiZW1haWwiOiJkQGp3dC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn1dLCJpYXQiOjE3NTk4OTUwOTF9._JFyGDmi7UZsPu_jHUW2w4L5rgItJ115IknY6AcSUCk ";
const bearerTokenDiner = "Bearer " + authTokenDiner;

const authTokenFranchisee =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6InBpenphIGZyYW5jaGlzZWUiLCJlbWFpbCI6ImZAand0LmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifSx7Im9iamVjdElkIjoxLCJyb2xlIjoiZnJhbmNoaXNlZSJ9LHsib2JqZWN0SWQiOjIsInJvbGUiOiJmcmFuY2hpc2VlIn1dLCJpYXQiOjE3NTk4OTU1NjJ9.nH2VRqAD8yfPbVL7YWkam2kI3dh9dNwYPslH2zEqVW0";
const bearerTokenFranchisee = "Bearer " + authTokenFranchisee;

const authTokenAdmin =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzU5ODk1ODg4fQ.Z8UwklGgXoiSaOUYLm4KFI53xUFHBPj5Nyttqykdtvk";
const bearerTokenAdmin = "Bearer " + authTokenAdmin;

test.beforeEach(async ({ page }) => {
  await page.route("**/version.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        version: "20000101.000000",
      }),
    });
  });
});

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

test("purchase without login", async ({ page }) => {
  await page.goto("/ ");
  await mockMenu(page);
  await page.getByRole("button", { name: "Order now" }).click();
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await page.getByRole("combobox").selectOption("1");
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("heading")).toContainText("Welcome back");
  await expect(page.locator("form")).toContainText("Login");
});

test("about page should show", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("list")).toContainText("homeabout");
});

test("history page should show", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByRole("list")).toContainText("homehistory");
  await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
});

test("franchise dashboard shows not logged in", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("list")).toContainText("homefranchise-dashboard");
  await expect(page.getByRole("alert")).toContainText(
    "If you are already a franchisee, pleaseloginusing your franchise account"
  );
});

async function signInFranchisee(page: Page) {
  await page.route("**/api/auth", async (route, request) => {
    if (
      request.method() === "PUT" &&
      (await request.postDataJSON()).email === "f@jwt.com" &&
      (await request.postDataJSON()).password === "franchisee"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: 3,
            name: "pizza franchisee",
            email: "f@jwt.com",
            roles: [
              {
                role: "diner",
              },
              {
                objectId: 1,
                role: "franchisee",
              },
              {
                objectId: 2,
                role: "franchisee",
              },
            ],
          },
          token: authTokenFranchisee,
        }),
      });
    } else {
      await route.continue();
    }
  });
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("f@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("franchisee");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await expect(page.getByLabel("Global")).toContainText("pf");
}

test("sign in as franchisee", async ({ page }) => {
  await page.goto("/");
  await signInFranchisee(page);
});

test("create and delete store", async ({ page }) => {
  await page.goto("/");
  await signInFranchisee(page);

  let callCount = 0;
  await page.route("**/api/franchise/3", async (route, request) => {
    if (
      request.method() === "GET" &&
      request.headers()["authorization"] === bearerTokenFranchisee
    ) {
      callCount++;
      const responseData =
        callCount === 1
          ? [
              {
                id: 1,
                name: "pizzaPocket",
                admins: [
                  {
                    id: 3,
                    name: "pizza franchisee",
                    email: "f@jwt.com",
                  },
                ],
                stores: [
                  {
                    id: 1,
                    name: "SLC",
                    totalRevenue: 0.2684,
                  },
                ],
              },
              {
                id: 2,
                name: "testing",
                admins: [
                  {
                    id: 3,
                    name: "pizza franchisee",
                    email: "f@jwt.com",
                  },
                ],
                stores: [],
              },
            ]
          : [
              {
                id: 1,
                name: "pizzaPocket",
                admins: [
                  {
                    id: 3,
                    name: "pizza franchisee",
                    email: "f@jwt.com",
                  },
                ],
                stores: [
                  {
                    id: 1,
                    name: "SLC",
                    totalRevenue: 0.2684,
                  },
                  {
                    id: 17,
                    name: "testing",
                    totalRevenue: 0,
                  },
                ],
              },
              {
                id: 2,
                name: "testing",
                admins: [
                  {
                    id: 3,
                    name: "pizza franchisee",
                    email: "f@jwt.com",
                  },
                ],
                stores: [],
              },
            ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responseData),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/franchise/1/store", async (route, request) => {
    if (
      request.method() === "POST" &&
      request.headers()["authorization"] === bearerTokenFranchisee
    ) {
      const postData = await request.postDataJSON();
      if (postData && postData.name === "testing") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: 17,
            franchiseId: 1,
            name: "testing",
          }),
        });
        return;
      }
    }
    await route.continue();
  });

  await page.route("**/api/franchise/1/store/17", async (route, request) => {
    if (
      request.method() === "DELETE" &&
      request.headers()["authorization"] === bearerTokenFranchisee
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "",
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/franchise/1/store/17", async (route, request) => {
    if (
      request.method() === "DELETE" &&
      request.headers()["authorization"] === bearerTokenFranchisee
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Store deleted" }),
      });
    } else {
      await route.continue();
    }
  });

  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("list")).toContainText("homefranchise-dashboard");
  // Be more specific - look for heading containing "pizzaPocket"
  await expect(
    page.getByRole("heading", { name: /pizzaPocket/i })
  ).toBeVisible();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page.getByRole("textbox", { name: "store name" }).fill("testing");
  await page.getByRole("button", { name: "Create" }).click();
  await page
    .getByRole("row", { name: "testing 0 ₿ Close" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Close" }).click();
});
