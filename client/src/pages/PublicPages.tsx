import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { AIChatBox } from "@/components/AIChatBox";
import { Activity, ArrowRight, ArrowUpRight, CheckCircle2, Code2, Cpu, Download, Globe2, LockKeyhole, Mail, MapPin, Phone, Play, Send, Shield, ShieldCheck, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/lib/trpc";

const iconMap: Record<string, typeof Code2> = { Code: Code2, Shield, Cpu, Activity, ShieldCheck, TrendingUp, Globe: Globe2, Sparkles };

function useContent() {
  const query = trpc.content.all.useQuery(undefined, { staleTime: 60_000 });
  return query.data;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.style.setProperty("--reveal-delay", `${delay}ms`);
        element.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function SectionIntro({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy: string; align?: "left" | "center" }) {
  return <div className={`section-intro ${align === "center" ? "centered" : ""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div>;
}

function ServiceCard({ service, index }: { service: any; index: number }) {
  const Icon = iconMap[service.icon] ?? Sparkles;
  let features: string[] = [];
  try { features = JSON.parse(service.features); } catch { features = service.features?.split(",") ?? []; }
  return <Reveal delay={index * 90}><article className="service-card glass-card"><div className="card-topline"><span className="card-index">0{index + 1}</span><span className="icon-orbit"><Icon size={22} /></span></div><span className="service-category">{service.category}</span><h3>{service.title}</h3><p>{service.shortDescription}</p><ul>{features.slice(0, 4).map((feature) => <li key={feature}><CheckCircle2 size={14} />{feature}</li>)}</ul><Link href="/services" className="text-link">Explore capability <ArrowUpRight size={15} /></Link></article></Reveal>;
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  return <Reveal delay={index * 100}><article className="project-card"><div className="project-image"><img src={project.imageUrl} alt={`${project.title} case study`} loading="lazy" /><span className="project-badge">{project.metrics}</span><span className="project-corner"><ArrowUpRight size={17} /></span></div><div className="project-copy"><span className="project-category">{project.category} · {project.client}</span><h3>{project.title}</h3><p>{project.summary}</p></div></article></Reveal>;
}

function ProjectDownload({ projectId }: { projectId: number }) {
  const download = trpc.projects.caseStudyPdf.useMutation({ onSuccess: ({ data, fileName }) => {
    const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
    const url = window.URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  } });
  return <button type="button" className="text-link project-download" onClick={() => download.mutate({ id: projectId })} disabled={download.isPending}><Download size={15} />{download.isPending ? "Preparing PDF..." : "Download case study"}</button>;
}

function StatsStrip({ stats }: { stats: any[] }) {
  return <div className="stats-strip">{stats.map((stat, index) => { const Icon = iconMap[stat.icon] ?? Activity; return <Reveal key={stat.id} delay={index * 80}><div className="stat-cell"><Icon size={18} /><strong>{stat.value}</strong><span>{stat.label}</span></div></Reveal>; })}</div>;
}

function MagneticCTA({ title = "Ready to build what comes next?" }: { title?: string }) {
  return <section className="container"><Reveal><div className="magnetic-cta"><div className="cta-orb" aria-hidden="true" /><span className="eyebrow">The next move is yours</span><h2>{title}</h2><p>Bring us the complex brief, the ambitious roadmap, or the threat nobody else has solved. We will bring the system thinking.</p><Link href="/contact" className="button button-primary">Start the conversation <ArrowUpRight size={16} /></Link></div></Reveal></section>;
}

type NavigatorMessage = { role: "user" | "assistant"; content: string };

function HomeAssistant({ settings }: { settings: any }) {
  const greeting = settings?.chatbotGreeting || "I’m the Zyvenox Lab navigator. Ask me which capability fits your brief, what a delivery phase looks like, or where to start.";
  const quickRepliesRaw = settings?.chatbotQuickReplies || "Which service fits a legacy platform rebuild?,How can Zyvenox Lab help with cybersecurity?,What does an AI delivery engagement include?";
  const suggestedPrompts = quickRepliesRaw.split(",").map((s: string) => s.trim()).filter(Boolean);

  const [messages, setMessages] = useState<NavigatorMessage[]>([{ role: "assistant", content: greeting }]);
  const chat = trpc.ai.navigate.useMutation({
    onSuccess: ({ reply }) => setMessages((current) => [...current, { role: "assistant", content: reply }]),
    onError: () => setMessages((current) => [...current, { role: "assistant", content: "I’m having trouble reaching the navigator right now. You can still explore **Services** or send the brief directly from the [contact page](/contact)." }]),
  });

  const extract = trpc.ai.extractRequirements.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("zyvenox-ai-prefill", JSON.stringify(data));
      window.location.href = "/contact?prefilled=true";
    },
  });

  const send = (content: string) => {
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    chat.mutate({ messages: nextMessages });
  };

  return (
    <section className="section-pad home-assistant-section">
      <div className="container home-assistant-grid">
        <Reveal>
          <div className="home-assistant-copy">
            <span className="eyebrow"><Sparkles size={14} /> Zyvenox navigator</span>
            <h2>Find the right <em>next move.</em></h2>
            <p>Get a fast, plain-language route through full-stack engineering, cybersecurity, and applied AI—then pre-fill the contact estimator instantly with AI requirement extraction.</p>
            <div className="assistant-links">
              <Link href="/services" className="text-link">Explore services <ArrowUpRight size={15} /></Link>
              <button
                className="button button-ghost ai-prefill-trigger"
                onClick={() => extract.mutate({ conversation: messages })}
                disabled={extract.isPending}
              >
                {extract.isPending ? "Extracting scope..." : "Pre-fill estimator from chat"} <Sparkles size={15} />
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <AIChatBox
            messages={messages}
            onSendMessage={send}
            isLoading={chat.isPending}
            height={420}
            className="home-assistant-chat"
            placeholder="Describe your project or ask a question…"
            emptyStateMessage="Ask the navigator where your technical brief belongs."
            suggestedPrompts={suggestedPrompts}
          />
        </Reveal>
      </div>
    </section>
  );
}

function PortfolioSection({ portfolio }: { portfolio: any[] }) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  return (
    <>
      <section id="portfolio" className="section-pad section-muted">
        <div className="container">
          <Reveal>
            <div className="split-heading">
              <SectionIntro eyebrow="04 / The people behind the work" title="Capability has a face." copy="Meet the practitioners who turn deep technical fluency into decisive momentum. Click any profile to inspect full details and additional lab imagery." />
              <Link href="/about" className="text-link">Meet the lab <ArrowUpRight size={15} /></Link>
            </div>
          </Reveal>
          {portfolio.length > 0 ? (
            <div className="portfolio-grid">
              {portfolio.slice(0, 3).map((item: any, index: number) => (
                <Reveal key={item.id} delay={index * 100}>
                  <article className="portfolio-card" role="button" tabIndex={0} onClick={() => setSelectedItem(item)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedItem(item); }} style={{ cursor: "pointer" }}>
                    <img src={item.mediaUrl} alt={`${item.authorName} — ${item.title}`} loading="lazy" />
                    <div className="portfolio-overlay">
                      <div>
                        <span>{item.authorRole}</span>
                        <h3>{item.authorName}</h3>
                      </div>
                      <span className="portfolio-arrow"><ArrowUpRight size={17} /></span>
                    </div>
                    <p>{item.description}</p>
                    <div className="tag-row">
                      {item.tags.split(",").map((tag: string) => <span key={tag}>{tag.trim()}</span>)}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="admin-empty glass-card" style={{ padding: 40, textAlign: "center" }}>
              <p>Portfolio profiles are currently managed and updated via the admin console.</p>
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div className="portfolio-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={() => setSelectedItem(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="portfolio-modal-content glass-card" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape") setSelectedItem(null); }} tabIndex={-1} style={{ background: "var(--card)", color: "var(--card-foreground)", maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 36, borderRadius: 16, border: "1px solid var(--line)", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", outline: "none" }}>
            <button onClick={() => setSelectedItem(null)} className="button button-ghost" aria-label="Close dialog" style={{ position: "absolute", top: 20, right: 20, padding: 8, minWidth: 36, height: 36, borderRadius: "50%" }}>✕</button>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
              <img src={selectedItem.mediaUrl} alt={selectedItem.authorName} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: "50%", border: "2px solid var(--accent)" }} />
              <div>
                <span className="eyebrow">{selectedItem.authorRole}</span>
                <h2 id="modal-title" style={{ fontSize: "1.75rem", margin: "4px 0" }}>{selectedItem.authorName}</h2>
                <p style={{ opacity: 0.8, fontSize: "0.95rem", margin: 0 }}>{selectedItem.title}</p>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: "1rem", marginBottom: 8, color: "var(--accent)" }}>Summary</h4>
              <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{selectedItem.description}</p>
            </div>
            {selectedItem.detailedBio && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: "1rem", marginBottom: 8, color: "var(--accent)" }}>Detailed Expertise &amp; Background</h4>
                <p style={{ lineHeight: 1.6, opacity: 0.9, whiteSpace: "pre-line" }}>{selectedItem.detailedBio}</p>
              </div>
            )}
            {selectedItem.additionalImages && (() => {
              try {
                const imgs = JSON.parse(selectedItem.additionalImages);
                if (Array.isArray(imgs) && imgs.length > 0) {
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: "1rem", marginBottom: 12, color: "var(--accent)" }}>Additional Lab Media &amp; Architecture Assets</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                        {imgs.map((url: string, i: number) => (
                          <img key={i} src={url} alt={`Additional asset ${i + 1}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (err) {
                console.error("Failed to parse additionalImages JSON:", err);
              }
              return null;
            })()}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <div className="tag-row">
                {selectedItem.tags.split(",").map((tag: string) => <span key={tag} style={{ background: "rgba(56,189,248,0.1)", padding: "4px 10px", borderRadius: 6, fontSize: "0.8rem", color: "var(--accent)", marginRight: 6 }}>{tag.trim()}</span>)}
              </div>
              <button onClick={() => setSelectedItem(null)} className="button button-primary">Close inspection</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Home() {
  const data = useContent();
  const settings = data?.settings;
  const services = data?.services ?? [];
  const projects = (data?.projects ?? []).filter((project: any) => project.featured);
  const stats = data?.successStats ?? [];
  const portfolio = data?.portfolioItems ?? [];
  return <>
    <SeoHead title="Zyvenox Lab | Digital systems, cybersecurity & AI" description="Zyvenox Lab engineers resilient full-stack systems, zero-trust cybersecurity, and autonomous AI for teams operating at the frontier." path="/" schema={{ "@type": "WebPage", name: "Zyvenox Lab home" }} />
    <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><Reveal><div className="eyebrow eyebrow-live"><span className="live-dot" />Independent technology studio · 2026</div><h1>Build beyond <em>possible.</em></h1><p className="hero-lede">{settings?.tagline ?? "Architecting resilient digital systems, military-grade cybersecurity, and autonomous AI engineering."}</p><div className="hero-actions"><Link href="/contact" className="button button-primary">Initiate a project <ArrowUpRight size={17} /></Link><Link href="/projects" className="button button-ghost">View the work <ArrowRight size={17} /></Link></div><div className="hero-trust"><span>Trusted for the hard problems</span><div className="trust-line" /></div></Reveal></div><Reveal className="hero-visual" delay={150}><div className="system-sphere"><div className="sphere-core"><span>ZY</span></div><div className="sphere-ring ring-one" /><div className="sphere-ring ring-two" /><div className="sphere-ring ring-three" /><span className="sphere-label label-one">SYSTEMS</span><span className="sphere-label label-two">SECURITY</span><span className="sphere-label label-three">INTELLIGENCE</span></div><div className="hero-status"><span className="status-pulse" />All systems nominal <span>·</span> 3 live environments</div></Reveal></div></section>
    <section className="container logo-rail"><span>ENGINEERING FOR</span><strong>APEX FINANCIAL</strong><strong>QUANTUMSHIELD</strong><strong>NEURALMATRIX</strong><strong>+ ambitious teams</strong></section>
    <section className="section-pad"><div className="container"><Reveal><SectionIntro eyebrow="01 / What we do" title="The advantage is in the architecture." copy="We make the invisible infrastructure visible: robust systems, sharp security, and AI that moves with intent. Every engagement is built around the constraints that matter." /></Reveal><div className="service-grid">{services.map((service: any, index: number) => <ServiceCard key={service.id} service={service} index={index} />)}</div></div></section>
    <section className="section-pad section-muted"><div className="container"><Reveal><div className="split-heading"><SectionIntro eyebrow="02 / Selected work" title="Proof, not promises." copy="A small selection of the systems we have taken from abstract risk to measurable advantage." /><Link href="/projects" className="text-link">See all projects <ArrowUpRight size={15} /></Link></div></Reveal><div className="project-grid">{projects.map((project: any, index: number) => <ProjectCard key={project.id} project={project} index={index} />)}</div></div></section>
    <section className="section-pad"><div className="container"><Reveal><SectionIntro eyebrow="03 / Operating metrics" title="Built to perform under pressure." copy="Our definition of success is operational: resilient releases, contained risk, and compounding speed." /></Reveal><StatsStrip stats={stats} /></div></section>
    <HomeAssistant settings={settings} />
    <PortfolioSection portfolio={portfolio} />
    <MagneticCTA />
  </>;
}

export function ServicesPage() {
  const data = useContent();
  const services = data?.services ?? [];
  return <><SeoHead title="Services | Full-stack, cybersecurity & AI | Zyvenox Lab" description="Explore Zyvenox Lab's full-stack engineering, cybersecurity, and AI capabilities, from distributed systems to autonomous agent platforms." path="/services" schema={{ "@type": "Service", serviceType: "Technology consulting" }} /><section className="page-hero"><div className="container"><Reveal><span className="eyebrow">Capabilities / 03 disciplines</span><h1>Serious tools for <em>serious leverage.</em></h1><p>We are intentionally small, deeply technical, and designed for the moments where a standard implementation is not enough.</p></Reveal></div></section><section className="section-pad"><div className="container services-detail-grid">{services.map((service: any, index: number) => { const Icon = iconMap[service.icon] ?? Sparkles; let features: string[] = []; try { features = JSON.parse(service.features); } catch { features = []; } return <Reveal key={service.id} delay={index * 90}><article className="service-detail glass-card"><div className="detail-number">0{index + 1}</div><div className="detail-icon"><Icon size={28} /></div><span className="service-category">{service.category}</span><h2>{service.title}</h2><p>{service.fullDescription}</p><div className="feature-list">{features.map((feature) => <div key={feature}><CheckCircle2 size={16} />{feature}</div>)}</div><Link href="/contact" className="button button-dark">Discuss this capability <ArrowUpRight size={16} /></Link></article></Reveal>; })}</div></section><MagneticCTA title="Need a capability that is not on the list?" /></>;
}

export function ProjectsPage() {
  const data = useContent();
  const projects = data?.projects ?? [];
  return <><SeoHead title="Projects | Selected systems & case studies | Zyvenox Lab" description="A selection of enterprise systems, cyber defense programs, and AI platforms engineered by Zyvenox Lab." path="/projects" schema={{ "@type": "CollectionPage", name: "Zyvenox Lab projects" }} /><section className="page-hero"><div className="container"><Reveal><span className="eyebrow">Selected work / 2023—26</span><h1>Systems that make the <em>difference.</em></h1><p>We measure a project by the distance between the first uncertain question and the first undeniable result.</p></Reveal></div></section><section className="section-pad"><div className="container project-list">{projects.map((project: any, index: number) => <Reveal key={project.id} delay={index * 90}><article className="project-feature"><div className="project-feature-image"><img src={project.imageUrl} alt={`${project.title} project`} loading="lazy" /></div><div className="project-feature-copy"><span className="eyebrow">0{index + 1} / {project.category}</span><h2>{project.title}</h2><p>{project.summary}</p><div className="metric-callout"><span>Outcome</span><strong>{project.metrics}</strong></div><span className="project-client">Delivered with {project.client}</span><ProjectDownload projectId={project.id} /></div></article></Reveal>)}</div></section><MagneticCTA title="Your hardest brief belongs here." /></>;
}

export function SuccessPage() {
  const data = useContent();
  const stats = data?.successStats ?? [];
  return <><SeoHead title="Success rate | Operational metrics | Zyvenox Lab" description="See the operational success metrics Zyvenox Lab uses to define resilient delivery, secure systems, and measurable enterprise impact." path="/success-rate" schema={{ "@type": "AboutPage", name: "Zyvenox Lab success rate" }} /><section className="page-hero"><div className="container"><Reveal><span className="eyebrow">Signal / not noise</span><h1>Momentum you can <em>measure.</em></h1><p>The best technical work leaves a trail: faster decisions, fewer incidents, and systems that keep their promises.</p></Reveal></div></section><section className="section-pad"><div className="container success-layout"><div className="success-statement"><span className="eyebrow">Our north star</span><h2>Reliability is a <em>feature.</em></h2><p>We make technical quality legible to the business. That means clear constraints, observable systems, and delivery rituals that compound instead of creating drag.</p><div className="success-line"><span /><span /><span /><span /><span /></div><span className="success-caption">Operational excellence, engineered in.</span></div><div className="success-stats-grid">{stats.map((stat: any, index: number) => { const Icon = iconMap[stat.icon] ?? Activity; return <Reveal key={stat.id} delay={index * 90}><article className="success-stat"><Icon size={20} /><strong>{stat.value}</strong><h3>{stat.label}</h3><p>{stat.description}</p></article></Reveal>; })}</div></div></section><MagneticCTA title="Let's define the metric that matters." /></>;
}

export function AboutPage() {
  const data = useContent();
  const team = data?.teamMembers ?? [];
  return <><SeoHead title="About the lab | Zyvenox Lab" description="Meet the systems thinkers, security architects, and AI researchers behind Zyvenox Lab." path="/about" schema={{ "@type": "AboutPage", name: "About Zyvenox Lab" }} /><section className="page-hero"><div className="container"><Reveal><span className="eyebrow">About / The lab</span><h1>Small by design. <em>Deep by default.</em></h1><p>We built Zyvenox Lab for teams with high-stakes ambitions and no patience for shallow implementation.</p></Reveal></div></section><section className="section-pad"><div className="container about-grid"><Reveal><div className="about-manifesto"><span className="eyebrow">A working manifesto</span><p className="manifesto-large">“The difficult thing is rarely the technology. It is seeing the entire system clearly enough to make the right trade.”</p><span className="manifesto-signature">— Zyvenox Lab, operating principle 01</span></div></Reveal><Reveal delay={120}><div className="about-copy"><p>We are an independent technology studio combining product engineering, adversarial security, and applied AI under one roof. The result is not just a build partner; it is a technical counterweight to uncertainty.</p><p>Our teams work from first principles, communicate in plain language, and leave every system more observable than we found it. The goal is durable advantage, not dependency.</p><div className="about-values"><div><span>01</span><strong>Clarity over theater.</strong></div><div><span>02</span><strong>Resilience over velocity.</strong></div><div><span>03</span><strong>Evidence over opinion.</strong></div></div></div></Reveal></div></section><section className="section-pad section-muted"><div className="container"><Reveal><SectionIntro eyebrow="The people" title="A point of view, multiplied." copy="A compact group of senior practitioners who are comfortable in the weeds and at the table." /></Reveal><div className="team-grid">{team.map((member: any, index: number) => <Reveal key={member.id} delay={index * 100}><article className="team-card"><img src={member.avatarUrl} alt={member.name} loading="lazy" /><div><span>{member.role}</span><h3>{member.name}</h3><p>{member.bio}</p><div className="tag-row">{member.skills.split(",").map((skill: string) => <span key={skill}>{skill.trim()}</span>)}</div></div></article></Reveal>)}</div></div></section><MagneticCTA title="Bring the lab into the room." /></>;
}

function CostEstimator({ initialCategory, initialBudget, initialTimeline, onEstimate }: { initialCategory?: string; initialBudget?: string; initialTimeline?: string; onEstimate: (budget: string, timeline: string) => void }) {
  const catMap: Record<string, string> = { fullstack: "Full-stack platform", cybersecurity: "Cybersecurity program", ai: "AI product system" };
  const [service, setService] = useState(initialCategory ? (catMap[initialCategory] ?? "Full-stack platform") : "Full-stack platform");
  const [scope, setScope] = useState("Growth build");
  const [complexity, setComplexity] = useState(2);
  const [integrations, setIntegrations] = useState(2);
  const [security, setSecurity] = useState(true);
  const [ai, setAi] = useState(false);
  const multipliers: Record<string, number> = { "Full-stack platform": 1, "Cybersecurity program": 0.82, "AI product system": 1.18 };
  const scopeBase: Record<string, number> = { "Focused sprint": 24000, "Growth build": 52000, "Enterprise system": 105000 };
  const total = Math.round((scopeBase[scope] + complexity * 8500 + integrations * 5200 + (security ? 12000 : 0) + (ai ? 18000 : 0)) * multipliers[service] / 1000) * 1000;
  const min = Math.round(total * .78 / 1000) * 1000;
  const max = Math.round(total * 1.26 / 1000) * 1000;
  const weeks = Math.round((scope === "Focused sprint" ? 4 : scope === "Growth build" ? 9 : 17) + complexity * 1.3 + integrations * .8 + (security ? 2 : 0) + (ai ? 3 : 0));
  const budget = `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;
  const timeline = `${Math.max(4, weeks - 2)} – ${weeks + 2} weeks`;
  return <div className="estimator-card glass-card"><div className="estimator-heading"><div><span className="eyebrow">Planning instrument</span><h2>Scope the first <em>signal.</em></h2></div><span className="estimator-live"><span className="status-pulse" />Live estimate</span></div><div className="estimator-layout"><div className="estimator-controls"><label>Primary capability<select value={service} onChange={(event) => setService(event.target.value)}><option>Full-stack platform</option><option>Cybersecurity program</option><option>AI product system</option></select></label><label>Engagement shape<select value={scope} onChange={(event) => setScope(event.target.value)}><option>Focused sprint</option><option>Growth build</option><option>Enterprise system</option></select></label><label>Architecture complexity<span className="range-value">{complexity === 1 ? "Contained" : complexity === 2 ? "Multi-system" : "Mission-critical"}</span><input type="range" min="1" max="3" value={complexity} onChange={(event) => setComplexity(Number(event.target.value))} /></label><label>External integrations<span className="range-value">{integrations} active systems</span><input type="range" min="0" max="6" value={integrations} onChange={(event) => setIntegrations(Number(event.target.value))} /></label><div className="estimator-switches"><button type="button" className={security ? "selected" : ""} onClick={() => setSecurity((value) => !value)}><ShieldCheck size={15} />Zero-trust security</button><button type="button" className={ai ? "selected" : ""} onClick={() => setAi((value) => !value)}><Cpu size={15} />AI acceleration</button></div></div><div className="estimator-result"><span className="eyebrow">Indicative range</span><strong>{budget}</strong><div className="estimate-meta"><span><small>Timeline</small>{timeline}</span><span><small>Model</small>Senior pod</span></div><p>Use this as a conversation starter, not a quote. We will sharpen it after discovery.</p><button type="button" className="button button-primary" onClick={() => onEstimate(budget, timeline)}>Use this estimate <ArrowUpRight size={16} /></button></div></div></div>;
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [budget, setBudget] = useState("$52k – $84k");
  const [timeline, setTimeline] = useState("8 – 13 weeks");
  const [form, setForm] = useState({ name: "", email: "", projectTitle: "", category: "Full-stack platform", brief: "" });
  const [hasPrefill, setHasPrefill] = useState(false);
  const [prefillCategory, setPrefillCategory] = useState<string | undefined>(undefined);
  const data = useContent();
  const contacts = data?.contactEntries ?? [];
  const { data: clientSession } = trpc.clientPortal.me.useQuery();

  useEffect(() => {
    const raw = sessionStorage.getItem("zyvenox-ai-prefill");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.estimatedBudget) setBudget(parsed.estimatedBudget);
        if (parsed.estimatedTimeline) setTimeline(parsed.estimatedTimeline);
        const catMap: Record<string, string> = { fullstack: "Full-stack platform", cybersecurity: "Cybersecurity program", ai: "AI product system" };
        setPrefillCategory(parsed.serviceCategory);
        setForm((curr) => ({
          ...curr,
          projectTitle: parsed.projectTitle || curr.projectTitle,
          category: catMap[parsed.serviceCategory] || curr.category,
          brief: parsed.briefDescription || curr.brief,
        }));
        setHasPrefill(true);
      } catch (err) {
        console.error("Failed to apply AI prefill:", err);
      }
    }
  }, []);

  const submitBrief = trpc.clientPortal.submitBrief.useMutation({
    onSuccess: () => {
      sessionStorage.removeItem("zyvenox-ai-prefill");
      setSubmitted(true);
    },
  });

  const updateEstimate = (nextBudget: string, nextTimeline: string) => { setBudget(nextBudget); setTimeline(nextTimeline); };

  return <>
    <SeoHead title="Contact | Project estimator & technical discovery | Zyvenox Lab" description="Estimate the timeline and budget for a full-stack, cybersecurity, or AI engagement, then submit a technical project brief to Zyvenox Lab." path="/contact" schema={{ "@type": "ContactPage", name: "Contact Zyvenox Lab", mainEntity: { "@type": "Service", name: "Technical project discovery" } }} />
    <section className="page-hero"><div className="container"><Reveal><span className="eyebrow">Contact / Initiate</span><h1>Make the next <em>move.</em></h1><p>Model the shape of the work, then give us the context to turn a rough range into a decisive plan.</p></Reveal></div></section>
    {hasPrefill && <section className="container" style={{ marginBottom: -30 }}><Reveal><div className="form-hint" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span><Sparkles size={15} style={{ display: "inline", marginRight: 6 }} /><strong>AI requirements successfully loaded</strong> from your navigator session. Review and transmit when ready.</span><button type="button" className="text-link" onClick={() => { sessionStorage.removeItem("zyvenox-ai-prefill"); setHasPrefill(false); }}>Clear</button></div></Reveal></section>}
    <section className="section-pad estimator-section"><div className="container"><Reveal><CostEstimator initialCategory={prefillCategory} initialBudget={budget} initialTimeline={timeline} onEstimate={updateEstimate} /></Reveal></div></section>
    <section className="section-pad"><div className="container contact-grid"><Reveal><div className="contact-details"><span className="eyebrow">Direct line</span><h2>Good conversations start with context.</h2><p>We reply within two working days with a point of view, not an automated funnel. Already working with us? <Link href="/portal" className="text-link">Open the client portal <ArrowUpRight size={15} /></Link></p>{contacts.map((item: any) => {
    const isEmail = item.type === "email";
    const isPhone = item.type === "phone";
    const href = isEmail ? `mailto:${item.value}` : isPhone ? `tel:${item.value}` : item.value.startsWith("http") ? item.value : undefined;
    const Icon = isEmail ? Mail : isPhone ? Phone : MapPin;
    const Tag = href ? "a" : "span";
    return <Tag key={item.id} href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined} className="contact-line"><Icon size={18} /><span><strong>{item.label}:</strong> {item.value}</span></Tag>;
  })}</div></Reveal><Reveal delay={120}><form className="contact-form glass-card" onSubmit={(event) => { event.preventDefault(); submitBrief.mutate({ clientEmail: form.email, clientName: form.name, projectTitle: form.projectTitle, serviceCategory: form.category, estimatedBudget: budget, estimatedTimeline: timeline, briefDescription: form.brief }); }}><div className="form-header"><span className="eyebrow">Project brief</span><span className="form-status"><span className="status-pulse" />Secure channel</span></div>{submitted ? <div className="form-success"><CheckCircle2 size={42} /><h2>Brief received.</h2><p>Your planning range of {budget} over {timeline} has been attached. Create a client portal account to track status updates.</p><Link href="/portal" className="button button-primary">Open client portal <ArrowUpRight size={16} /></Link></div> : <><label>Name<input required name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label><label>Work email<input required type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" /></label><label>Project title<input required name="projectTitle" value={form.projectTitle} onChange={(event) => setForm({ ...form, projectTitle: event.target.value })} placeholder="What are you building?" /></label><label>Capability<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Full-stack platform</option><option>Cybersecurity program</option><option>AI product system</option></select></label><label>What are you solving?<textarea required name="brief" value={form.brief} onChange={(event) => setForm({ ...form, brief: event.target.value })} rows={5} placeholder="A few lines on the system, opportunity, or risk..."></textarea></label>{submitBrief.error && <div className="form-error">{submitBrief.error.message}</div>}{!clientSession && <p className="form-hint">Portal tracking is protected. <Link href="/portal" className="text-link">Sign in or create an account before submitting <ArrowUpRight size={14} /></Link></p>}<button className="button button-primary" disabled={submitBrief.isPending} type="submit">{submitBrief.isPending ? "Transmitting..." : "Transmit brief"} <Send size={16} /></button></>}</form></Reveal></div></section></>;
}
