import { sleep, check, group, fail } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;

  const vars = {};

  group("Login and Order - https://pizza.taskie.click/", function () {
    // Initial Load
    response = http.get("https://pizza.taskie.click/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.7",
        "cache-control": "no-cache",
        priority: "u=0, i",
        "sec-ch-ua": '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
      },
    });
    sleep(2);

    // Login
    response = http.put(
      "https://pizza-service.taskie.click/api/auth",
      '{"email":"d@jwt.com","password":"diner"}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.7",
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://pizza.taskie.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "sec-gpc": "1",
        },
      }
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }
    vars["token1"] = jsonpath.query(response.json(), "$.token")[0];

    sleep(4);

    // Menu
    response = http.get("https://pizza-service.taskie.click/api/order/menu", {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.7",
        authorization: `Bearer ${vars["token1"]}`,
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://pizza.taskie.click",
        priority: "u=1, i",
        "sec-ch-ua": '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
      },
    });

    // Stores
    response = http.get(
      "https://pizza-service.taskie.click/api/franchise?page=0&limit=20&name=*",
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.7",
          authorization: `Bearer ${vars["token1"]}`,
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://pizza.taskie.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "sec-gpc": "1",
        },
      }
    );
    sleep(2);

    // User
    response = http.get("https://pizza-service.taskie.click/api/user/me", {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.7",
        authorization: `Bearer ${vars["token1"]}`,
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://pizza.taskie.click",
        priority: "u=1, i",
        "sec-ch-ua": '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
      },
    });
    sleep(2);

    // Order
    response = http.post(
      "https://pizza-service.taskie.click/api/order",
      '{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.7",
          authorization: `Bearer ${vars["token1"]}`,
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://pizza.taskie.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "sec-gpc": "1",
        },
      }
    );
    sleep(1.5);

    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Order was *not* 200");
    }

    vars["pizzaJwt"] = jsonpath.query(response.json(), "$.jwt")[0];

    // Verify
    response = http.post(
      "https://pizza-factory.cs329.click/api/order/verify",
      `{"jwt":"${vars["pizzaJwt"]}"}`,
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.7",
          authorization: `Bearer ${vars["token1"]}`,
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://pizza.taskie.click",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-fetch-storage-access": "none",
          "sec-gpc": "1",
        },
      }
    );
  });
}
