import type { MouseEvent } from "react";

/**
 * "Skip to content" link for keyboard and screen-reader users (WCAG 2.4.1). Hidden until
 * focused; moves focus to the page's <main> landmark, so pages don't need a shared id.
 */
export function SkipLink() {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;
    event.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
  };

  return (
    <a
      href="#main"
      onClick={skip}
      className="fixed left-4 top-2 z-[100] -translate-y-[150%] bg-black px-4 py-2 text-sm font-semibold text-white focus:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
    >
      Sari la conținut
    </a>
  );
}
