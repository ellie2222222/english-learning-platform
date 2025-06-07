/***
 * NOTE: put all the static routes before the dynamic routes
 */

interface PublicRoutes {
  path: string;
  method: string;
}

const publicRoutes: PublicRoutes[] = [
  //auth
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/signup", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
  { path: "/send-reset-password-pin", method: "POST" },
  { path: "/confirm-reset-password-pin", method: "POST" },
  { path: "/reset-password", method: "PUT" },

  //achievement
  { path: "/api/achievements", method: "GET" },
  { path: "/api/achievements/:id", method: "GET" },

  //membership
  { path: "/api/memberships", method: "GET" },
  { path: "/api/memberships/:id", method: "GET" },

  // Payment
  { path: "/api/payments/paypal/success", method: "GET" },
  { path: "/api/payments/paypal/failed", method: "GET" },
  { path: "/api/payments/vnpay/callback", method: "GET" },

  // Blog
  { path: "/api/blogs", method: "GET" },
  { path: "/api/blogs/:id", method: "GET" },
];

export default publicRoutes;
