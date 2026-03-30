import { Slot, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import { Header } from "~/components/Header";

export default component$(() => {
  const location = useLocation();
  const isLoginPage = location.url.pathname === "/login/";

  return (
    <>
      {!isLoginPage && <Header />}
      <div class={isLoginPage ? "" : "pt-16"}>
        <Slot />
      </div>
    </>
  );
});

