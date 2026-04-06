import { Slot, component$ } from "@builder.io/qwik";
import { useLocation, routeLoader$ } from "@builder.io/qwik-city";

import { Header } from "~/components/Header";
import { getCurrentUser } from "~/lib/auth";

export const useAuthUser = routeLoader$((event) => {
  return getCurrentUser(event.cookie);
});

export default component$(() => {
  const location = useLocation();
  const authUser = useAuthUser();
  const pathname = location.url.pathname;
  const isLoginPage = pathname === "/login/";
  const isPlatform = pathname.startsWith("/platform");

  return (
    <>
      {!isLoginPage && <Header user={authUser.value} />}
      <div class={isLoginPage ? "" : "pt-[104px]"}>
        <Slot />
      </div>
    </>
  );
});

