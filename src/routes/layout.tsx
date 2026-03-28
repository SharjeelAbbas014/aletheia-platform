import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

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

  return (
    <>
      <SiteNav authenticated={session.value.authenticated} />
      <Slot />
    </>
  );
});
