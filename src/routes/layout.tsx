import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";

import { SiteNav } from "~/components/site-nav";
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
  const showSiteNav = location.url.pathname !== "/";

  return (
    <>
      {showSiteNav ? (
        <SiteNav authenticated={session.value.authenticated} />
      ) : null}
      <Slot />
    </>
  );
});
