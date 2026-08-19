import { useEffect } from "react";

const SITE_URL = "https://zyvenoxlab.com";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export default function SeoHead({ title, description, path, type = "website", schema, keywords = "full-stack development, cybersecurity consulting, AI engineering, enterprise software, technical delivery partner", noIndex = false }: { title: string; description: string; path: string; type?: string; schema?: Record<string, unknown>; keywords?: string; noIndex?: boolean }) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path === "/" ? "/" : path}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "robots", noIndex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:site_name", "Zyvenox Lab");
    setMeta("property", "og:image", `${SITE_URL}/og-image.svg`);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", `${SITE_URL}/og-image.svg`);

    let canonical = document.head.querySelector<HTMLLinkElement>("link[rel=canonical]");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const id = "page-jsonld";
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "ProfessionalService", "@id": `${SITE_URL}/#organization`, name: "Zyvenox Lab", url: SITE_URL, email: "contact@zyvenoxlab.com", description: "Technical delivery partner for full-stack engineering, cybersecurity, and applied AI systems.", areaServed: "Global", serviceType: ["Full-stack development", "Cybersecurity consulting", "AI engineering", "Technical architecture"] },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "Zyvenox Lab", publisher: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "BreadcrumbList", itemListElement: path === "/" ? [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }] : [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: title.split(" | ")[0], item: canonicalUrl }] },
        ...(schema ? [schema] : []),
      ],
    });
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, [description, keywords, noIndex, path, schema, title, type]);

  return null;
}
