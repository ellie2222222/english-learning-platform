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

  //achievement
  { path: "/api/achievements", method: "GET" },
  { path: "/api/achievements/:id", method: "GET" },

  //membership
  { path: "/api/memberships", method: "GET" },
  { path: "/api/memberships/:id", method: "GET" },
];

export default publicRoutes;
