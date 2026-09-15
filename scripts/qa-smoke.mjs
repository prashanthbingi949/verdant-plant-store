const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

const checks = [
  { path: "/", expected: 200, label: "home" },
  { path: "/shop", expected: 200, label: "shop" },
  { path: "/shop/aloe-vera", expected: 200, label: "product detail" },
  { path: "/favorites", expected: 200, label: "favorites" },
  { path: "/cart", expected: 200, label: "cart" },
  { path: "/checkout", expected: 200, label: "checkout" },
  { path: "/admin", expected: [200, 307, 308], label: "admin auth gate" },
  { path: "/admin/products", expected: [200, 307, 308], label: "admin products auth gate" },
  { path: "/admin/inventory", expected: [200, 307, 308], label: "admin inventory auth gate" },
  { path: "/admin/products/master", expected: [200, 307, 308], label: "product master auth gate" },
  {
    path: "/api/auth/me",
    expected: 200,
    label: "customer auth status",
  },
  {
    path: "/api/auth/login",
    method: "POST",
    body: {},
    expected: 400,
    label: "login validation",
  },
  {
    path: "/api/auth/signup",
    method: "POST",
    body: {},
    expected: 400,
    label: "signup validation",
  },
  {
    path: "/api/auth/signup",
    method: "POST",
    body: { name: "QA", email: "invalid", password: "short" },
    expected: 400,
    label: "signup input validation",
  },
  {
    path: "/api/order-tracking",
    expected: 400,
    label: "order tracking validation",
  },
  {
    path: "/api/auth/logout",
    method: "POST",
    expected: 200,
    label: "customer logout",
  },
];

function expectedStatus(expected) {
  return Array.isArray(expected) ? expected : [expected];
}

let failed = 0;

for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString();
  try {
    const response = await fetch(url, {
      method: check.method || "GET",
      headers: check.body ? { "Content-Type": "application/json" } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
      redirect: "manual",
    });
    const ok = expectedStatus(check.expected).includes(response.status);
    console.log(`${ok ? "PASS" : "FAIL"} ${check.label}: ${response.status} ${url}`);
    if (!ok) failed += 1;
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${check.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} smoke check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} smoke checks passed.`);
