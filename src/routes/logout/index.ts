import type { RequestHandler } from "@builder.io/qwik-city";

import { clearSession } from "~/lib/auth";

export const onPost: RequestHandler = ({ cookie, redirect }) => {
  clearSession(cookie);
  throw redirect(302, "/login");
};
