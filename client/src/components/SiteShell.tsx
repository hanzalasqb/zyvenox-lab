import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, ChevronRight, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ParticleField from "./ParticleField";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Success rate", href: "/success-rate" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "About", href: "/about" },
  { label: "Client portal", href: "/portal" },
];

export function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="Zyvenox Lab home">
      <span className="brand-glyph" aria-hidden="true"><span /></span>
      <span className="brand-wordmark">zyvenox<span>lab</span></span>
    </Link>
  );
}

export function Breadcrumbs({ label }: { label?: string }) {
  const [location] = useLocation();
  const current = label || navigation.find((item) => item.href === location)?.label || (location === "/" ? "Home" : "Page");
  if (location === "/") return null;
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span aria-current="page">{current}</span>
    </nav>
  );
}

export default function SiteShell({ children, breadcrumbLabel }: { children: React.ReactNode; breadcrumbLabel?: string }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="site-frame">
      <ParticleField />
      <div className="ambient-grid" aria-hidden="true" />
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={`desktop-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={location === item.href ? "active" : ""}>{item.label}</Link>
            ))}
            <Link href="/contact" className={`nav-contact ${location === "/contact" ? "active" : ""}`}>Start a conversation <ArrowUpRight size={15} /></Link>
          </nav>
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={toggleTheme} className="theme-toggle-switch" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", padding: "6px 12px", borderRadius: 20, cursor: "pointer", color: "var(--foreground)", fontSize: "0.85rem", transition: "all 0.2s ease" }} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
              {theme === "dark" ? <Sun size={15} style={{ color: "#38bdf8" }} /> : <Moon size={15} style={{ color: "#0284c7" }} />}
              <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
            </button>
            <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>
      <main className="site-main">
        <div className="container"><Breadcrumbs label={breadcrumbLabel} /></div>
        {children}
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Digital systems for teams that refuse to ship ordinary.</p>
            <div className="social-row" aria-label="Social links">
              <a href="https://github.com/zyvenox-lab" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
              <a href="https://linkedin.com/company/zyvenox-lab" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
              <a href="https://twitter.com/zyvenoxlab" target="_blank" rel="noreferrer" aria-label="X / Twitter">X</a>
            </div>
          </div>
          <div className="footer-column"><span className="eyebrow">Explore</span><Link href="/services">Services</Link><Link href="/projects">Projects</Link><Link href="/success-rate">Success rate</Link><Link href="/about">About the lab</Link></div>
          <div className="footer-column"><span className="eyebrow">Connect</span><a href="mailto:contact@zyvenoxlab.com">contact@zyvenoxlab.com</a><a href="tel:+18009938366">+1 (800) 993-8366</a><span>Silicon Valley, CA</span></div>
          <div className="footer-cta"><span className="eyebrow">Have a complex problem?</span><h3>Let's turn the hard part into your advantage.</h3><Link href="/contact" className="text-link">Book a discovery call <ArrowUpRight size={15} /></Link></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Zyvenox Lab. All systems nominal.</span><span>Built for the next frontier.</span></div>
      </footer>
    </div>
  );
}
