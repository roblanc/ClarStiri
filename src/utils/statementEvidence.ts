import type { Statement } from "@/data/publicFigures";

export type StatementEvidenceStrength = "strong" | "medium" | "weak";

export interface StatementEvidence {
  href: string;
  hostLabel: string;
  linkLabel: string;
  badgeLabel: string;
  strength: StatementEvidenceStrength;
  note?: string;
}

function safeParseUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function hostLabelFromUrl(url: URL | null, rawUrl: string): string {
  if (!url) return rawUrl;
  return url.hostname.replace(/^www\./, "");
}

function inferSourceEvidence(sourceUrl: string): Omit<StatementEvidence, "href"> {
  const parsed = safeParseUrl(sourceUrl);
  const hostLabel = hostLabelFromUrl(parsed, sourceUrl);

  if (!parsed) {
    return {
      hostLabel,
      linkLabel: "Link sursă",
      badgeLabel: "Dovadă slabă",
      strength: "weak",
      note: "Linkul asociat acestei declarații nu a putut fi validat automat.",
    };
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  const hostname = parsed.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be" || hostname.includes("youtube.com")) {
    const isDirectVideo = hostname === "youtu.be"
      || parsed.pathname.startsWith("/watch")
      || parsed.pathname.startsWith("/shorts/")
      || parsed.pathname.startsWith("/live/");

    if (isDirectVideo) {
      return {
        hostLabel,
        linkLabel: "Video sursă",
        badgeLabel: "Sursă directă",
        strength: "strong",
      };
    }

    return {
      hostLabel,
      linkLabel: "Canal YouTube",
      badgeLabel: "Canal generic",
      strength: "weak",
      note: "Linkul duce către canalul autorului, nu către un video exact în care citatul poate fi verificat.",
    };
  }

  if (hostname.includes("instagram.com")) {
    const isDirectPost = parsed.pathname.startsWith("/p/")
      || parsed.pathname.startsWith("/reel/")
      || parsed.pathname.startsWith("/tv/");

    if (isDirectPost) {
      return {
        hostLabel,
        linkLabel: "Postare sursă",
        badgeLabel: "Sursă directă",
        strength: "strong",
      };
    }

    return {
      hostLabel,
      linkLabel: "Profil Instagram",
      badgeLabel: "Profil generic",
      strength: "weak",
      note: "Linkul duce către profilul de Instagram, nu către postarea exactă în care apare citatul.",
    };
  }

  if (hostname.includes("facebook.com")) {
    const isDirectPost = parsed.pathname.includes("/posts/")
      || parsed.pathname.includes("/videos/")
      || parsed.pathname.includes("/permalink/")
      || parsed.pathname === "/permalink.php"
      || parsed.pathname === "/watch";

    if (isDirectPost) {
      return {
        hostLabel,
        linkLabel: "Postare sursă",
        badgeLabel: "Sursă directă",
        strength: "strong",
      };
    }

    return {
      hostLabel,
      linkLabel: "Pagină Facebook",
      badgeLabel: "Profil generic",
      strength: "weak",
      note: "Linkul duce către pagina de Facebook, nu către postarea exactă asociată declarației.",
    };
  }

  if (hostname.includes("tiktok.com")) {
    if (parsed.pathname.includes("/video/")) {
      return {
        hostLabel,
        linkLabel: "Video sursă",
        badgeLabel: "Sursă directă",
        strength: "strong",
      };
    }

    return {
      hostLabel,
      linkLabel: "Profil TikTok",
      badgeLabel: "Profil generic",
      strength: "weak",
      note: "Linkul duce către profilul TikTok, nu către clipul exact al declarației.",
    };
  }

  if (segments.length >= 2) {
    return {
      hostLabel,
      linkLabel: "Articol asociat",
      badgeLabel: "Sursă secundară",
      strength: "medium",
      note: "Linkul pare să ducă la un articol specific, dar citatul ar trebui verificat și în conținutul acelui articol.",
    };
  }

  return {
    hostLabel,
    linkLabel: "Homepage sursă",
    badgeLabel: "Dovadă slabă",
    strength: "weak",
    note: "Linkul duce doar către homepage-ul publicației, nu către o probă directă a citatului.",
  };
}

export function getStatementEvidence(statement: Statement): StatementEvidence {
  if (statement.articleUrl) {
    const articleUrl = safeParseUrl(statement.articleUrl);
    return {
      href: statement.articleUrl,
      hostLabel: hostLabelFromUrl(articleUrl, statement.articleUrl),
      linkLabel: "Articol sursă",
      badgeLabel: statement.verificationStatus === "verified" ? "Sursă directă" : "Sursă secundară",
      strength: statement.verificationStatus === "verified" ? "strong" : "medium",
      note: statement.evidenceNote || "Linkul duce către un articol specific; citatul trebuie să fie verificabil în conținutul acelui articol.",
    };
  }

  const inferred = inferSourceEvidence(statement.sourceUrl);
  const strength = statement.verificationStatus === "unverified"
    ? "weak"
    : statement.verificationStatus === "verified"
      ? "strong"
      : inferred.strength;

  const badgeLabel = statement.verificationStatus === "unverified"
    ? "Neconfirmat"
    : statement.verificationStatus === "verified"
      ? "Sursă directă"
      : inferred.badgeLabel;

  return {
    href: statement.sourceUrl,
    hostLabel: inferred.hostLabel,
    linkLabel: inferred.linkLabel,
    badgeLabel,
    strength,
    note: statement.evidenceNote || inferred.note,
  };
}

export function getStatementEvidenceBadgeClass(strength: StatementEvidenceStrength): string {
  if (strength === "strong") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (strength === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}
