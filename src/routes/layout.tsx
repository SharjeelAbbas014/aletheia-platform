import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";

import { Header } from "~/components/Header";
import { getCurrentUser, isAuthenticated } from "~/lib/auth";

export const useSession = routeLoader$(({ cookie }) => {
  const authenticated = isAuthenticated(cookie);

  return {
    authenticated,
    user: getCurrentUser(cookie)
  };
});

export default component$(() => {
  const session = useSession();
  const location = useLocation();
  const isLoginPage = location.url.pathname === "/login/";

  return (
    <>
      {!isLoginPage && <Header authenticated={session.value.authenticated} />}
      <div class={isLoginPage ? "" : "pt-16"}>
        <Slot />
      </div>
    </>
  );
});


