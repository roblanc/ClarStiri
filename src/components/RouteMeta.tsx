import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://thesite.ro";
const DEFAULT_TITLE = "thesite.ro | Știri din toate perspectivele";
const DEFAULT_DESCRIPTION =
  "Agregator de știri românești. Aceeași poveste, perspective multiple — analizate pe axa stânga–centru–dreapta.";

/** Title/description for routes whose page component doesn't set its own <Helmet>. */
const ROUTE_META: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/editorial": {
    title: "Ediția editorială | thesite.ro",
    description: "Știrile zilei în format de revistă: aceeași poveste din surse de stânga, centru și dreapta.",
  },
  "/tribuni": {
    title: "Tribuni — vocile care setează tonul dezbaterii | thesite.ro",
    description:
      "Cine setează tonul dezbaterii publice? Vocile care împing teme și narațiuni în spațiul media românesc, pe baza declarațiilor verificate.",
  },
  "/surse": {
    title: "Surse și bias media | thesite.ro",
    description:
      "Cine deține fiecare publicație, ce linie editorială are și de ce îi atribuim un anumit scor de bias și de factualitate.",
  },
  "/metodologie": {
    title: "Metodologie — cum funcționează thesite.ro",
    description:
      "Cum grupăm știrile, cum calculăm distribuția stânga–centru–dreapta și cum evaluăm factualitatea surselor.",
  },
  "/despre": {
    title: "Despre thesite.ro | Cum funcționează",
    description: "Cum funcționează thesite.ro — agregator de știri românești cu analiză de bias și barometru de opinie.",
  },
  "/contact": {
    title: "Contact | thesite.ro",
    description: "Scrie-ne pentru corecturi, sugestii de surse sau parteneriate.",
  },
  "/cauta": {
    title: "Caută știri | thesite.ro",
    description: "Caută în știrile agregate din presa românească și compară cum relatează fiecare tabără.",
  },
  "/studio": { title: "Studio | thesite.ro", description: DEFAULT_DESCRIPTION, noindex: true },
  "/studio-instagram": { title: "Studio Instagram | thesite.ro", description: DEFAULT_DESCRIPTION, noindex: true },
};

/**
 * Baseline per-route <title>, description and canonical, rendered above the routes so any page
 * that sets its own <Helmet> (story, category, source, voice pages, homepage) overrides it.
 * Without this, every page without Helmet inherited the homepage title and had no canonical.
 */
export function RouteMeta() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const meta = ROUTE_META[path];
  const title = meta?.title ?? DEFAULT_TITLE;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE}${path === "/" ? "" : path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {meta?.noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
