import { useState, useEffect, useMemo } from "react";
import { BarChart3, BookOpen, BriefcaseBusiness, Check, ChevronRight, ImagePlus, LayoutDashboard, LogOut, Mail, MessageSquareText, Plus, Save, Settings2, ShieldCheck, Trash2, Upload, Users, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Resource = "overview" | "settings" | "services" | "projects" | "portfolio" | "stats" | "team" | "contacts" | "briefs";
const resourceLabels: Record<Resource, string> = { overview: "Overview", settings: "Site settings", services: "Services", projects: "Projects", portfolio: "Portfolio", stats: "Success rate", team: "Team profiles", contacts: "Contact entries", briefs: "Client briefs" };
const resourceIcons: Record<Resource, typeof LayoutDashboard> = { overview: LayoutDashboard, settings: Settings2, services: BriefcaseBusiness, projects: BookOpen, portfolio: ImagePlus, stats: BarChart3, team: Users, contacts: Mail, briefs: MessageSquareText };

function field(value: any) { return value === undefined || value === null ? "" : String(value); }

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.admin.login.useMutation({ onSuccess: ({ token }) => { sessionStorage.setItem("zyvenox-admin-token", token); void utils.admin.me.invalidate(); }, onError: (err) => setError(err.message) });
  return <main className="admin-login"><div className="admin-login-card"><div className="admin-lock"><ShieldCheck size={26} /></div><span className="eyebrow">Zyvenox Lab / Secure console</span><h1>Operator access.</h1><p>Authenticate to edit the live content system. This workspace is protected by a signed session.</p><form onSubmit={(event) => { event.preventDefault(); setError(""); login.mutate({ username, password }); }}><label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="operator ID" /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="access key" /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary" disabled={login.isPending} type="submit">{login.isPending ? "Verifying..." : "Enter console"}<ChevronRight size={16} /></button></form><span className="admin-security-note"><ShieldCheck size={14} /> Session expires automatically after 12 hours</span></div></main>;
}

function AdminField({ label, value, onChange, multiline = false, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; placeholder?: string }) {
  return <label>{label}{multiline ? <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}</label>;
}

export default function AdminPage() {
  const { data: session, isLoading: sessionLoading } = trpc.admin.me.useQuery();
  if (sessionLoading) return <main className="admin-loading"><div className="loader-orbit" /><span>Initializing secure console...</span></main>;
  if (!session?.authenticated) return <LoginScreen />;
  return <AdminConsole />;
}

function AdminConsole() {
  const [resource, setResource] = useState<Resource>("overview");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.content.all.useQuery();
  const { data: briefs, isLoading: briefsLoading } = trpc.admin.allBriefs.useQuery(undefined, { enabled: resource === "briefs" });
  const logout = trpc.admin.logout.useMutation({ onSuccess: () => { sessionStorage.removeItem("zyvenox-admin-token"); window.location.reload(); } });
  const settingsMutation = trpc.admin.updateSettings.useMutation({ onSuccess: () => refresh("Settings saved") });
  const uploadMutation = trpc.admin.uploadMedia.useMutation();
  const createService = trpc.admin.createService.useMutation({ onSuccess: () => refresh("Service created") });
  const updateService = trpc.admin.updateService.useMutation({ onSuccess: () => refresh("Service updated") });
  const deleteService = trpc.admin.deleteService.useMutation({ onSuccess: () => refresh("Service removed") });
  const createProject = trpc.admin.createProject.useMutation({ onSuccess: () => refresh("Project created") });
  const updateProject = trpc.admin.updateProject.useMutation({ onSuccess: () => refresh("Project updated") });
  const deleteProject = trpc.admin.deleteProject.useMutation({ onSuccess: () => refresh("Project removed") });
  const createPortfolio = trpc.admin.createPortfolioItem.useMutation({ onSuccess: () => refresh("Portfolio item created") });
  const updatePortfolio = trpc.admin.updatePortfolioItem.useMutation({ onSuccess: () => refresh("Portfolio item updated") });
  const deletePortfolio = trpc.admin.deletePortfolioItem.useMutation({ onSuccess: () => refresh("Portfolio item removed") });
  const createStat = trpc.admin.createStat.useMutation({ onSuccess: () => refresh("Metric created") });
  const updateStat = trpc.admin.updateStat.useMutation({ onSuccess: () => refresh("Metric updated") });
  const deleteStat = trpc.admin.deleteStat.useMutation({ onSuccess: () => refresh("Metric removed") });
  const createTeam = trpc.admin.createTeamMember.useMutation({ onSuccess: () => refresh("Team profile created") });
  const updateTeam = trpc.admin.updateTeamMember.useMutation({ onSuccess: () => refresh("Team profile updated") });
  const deleteTeam = trpc.admin.deleteTeamMember.useMutation({ onSuccess: () => refresh("Team profile removed") });
  const updateBriefStatus = trpc.admin.updateBriefStatus.useMutation({ onSuccess: () => { setNotice("Brief status updated"); void utils.admin.allBriefs.invalidate(); window.setTimeout(() => setNotice(""), 2800); } });

  function refresh(message: string) {
    setNotice(message);
    setEditingId(null);
    void utils.content.all.invalidate();
    window.setTimeout(() => setNotice(""), 2800);
  }
  const list = resource === "briefs" ? briefs : resource === "services" ? data?.services : resource === "projects" ? data?.projects : resource === "portfolio" ? data?.portfolioItems : resource === "stats" ? data?.successStats : resource === "team" ? data?.teamMembers : data?.contactEntries;
  const current = useMemo(() => (list as any[] | undefined)?.find((item) => item.id === editingId), [editingId, list]);
  useEffect(() => {
    if (resource === "settings") {
      const settings = data?.settings;
      setForm(settings ? Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, field(value)])) : {});
    } else if (current) {
      setForm(Object.fromEntries(Object.entries(current).map(([key, value]) => [key, field(value)])));
    } else {
      setForm({ order: "0", featured: "1", portfolioVisible: "1", icon: resource === "stats" ? "Activity" : resource === "services" ? "Code" : "" });
    }
  }, [current, data?.settings, resource]);
  function setValue(key: string, value: string) { setForm((previous) => ({ ...previous, [key]: value })); }
  function selectResource(next: Resource) { setResource(next); setEditingId(null); setNotice(""); }
  async function handleUpload(file: File, overrideKey?: string) {
    const targetKey = overrideKey || (resource === "projects" ? "imageUrl" : resource === "team" ? "avatarUrl" : "mediaUrl");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1] ?? "";
      uploadMutation.mutate({ fileName: file.name, mimeType: file.type, fileBase64: base64 }, {
        onSuccess: (result) => {
          if (targetKey === "additionalImages") {
            try {
              const currentArr = JSON.parse(form.additionalImages || "[]");
              setValue("additionalImages", JSON.stringify([...currentArr, result.url]));
            } catch {
              setValue("additionalImages", JSON.stringify([result.url]));
            }
          } else {
            setValue(targetKey, result.url);
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (resource === "settings") {
      settingsMutation.mutate({ siteTitle: form.siteTitle ?? "", tagline: form.tagline ?? "", description: form.description ?? "", portfolioVisible: Number(form.portfolioVisible ?? 1), contactEmail: form.contactEmail ?? "", contactPhone: form.contactPhone ?? "", address: form.address ?? "", socialLinks: form.socialLinks ?? "{}", chatbotGreeting: form.chatbotGreeting ?? "", chatbotQuickReplies: form.chatbotQuickReplies ?? "" });
      return;
    }
    const payload: any = { ...form, order: Number(form.order || 0) };
    if (resource === "projects") payload.featured = Number(form.featured || 0);
    if (!editingId) {
      if (resource === "services") createService.mutate(payload); else if (resource === "projects") createProject.mutate(payload); else if (resource === "portfolio") createPortfolio.mutate(payload); else if (resource === "stats") createStat.mutate(payload); else if (resource === "team") createTeam.mutate(payload); else if (resource === "contacts") createContact.mutate(payload);
    } else {
      if (resource === "services") updateService.mutate({ id: editingId, data: payload }); else if (resource === "projects") updateProject.mutate({ id: editingId, data: payload }); else if (resource === "portfolio") updatePortfolio.mutate({ id: editingId, data: payload }); else if (resource === "stats") updateStat.mutate({ id: editingId, data: payload }); else if (resource === "team") updateTeam.mutate({ id: editingId, data: payload }); else if (resource === "contacts") updateContact.mutate({ id: editingId, data: payload });
    }
  }
  function remove(id: number) {
    if (!window.confirm("Remove this item from the live site?")) return;
    if (resource === "services") deleteService.mutate({ id }); else if (resource === "projects") deleteProject.mutate({ id }); else if (resource === "portfolio") deletePortfolio.mutate({ id }); else if (resource === "stats") deleteStat.mutate({ id }); else if (resource === "team") deleteTeam.mutate({ id }); else if (resource === "contacts") deleteContact.mutate({ id });
  }
  const createContact = trpc.admin.createContactEntry.useMutation({ onSuccess: () => refresh("Contact entry created") });
  const updateContact = trpc.admin.updateContactEntry.useMutation({ onSuccess: () => refresh("Contact entry updated") });
  const deleteContact = trpc.admin.deleteContactEntry.useMutation({ onSuccess: () => refresh("Contact entry removed") });

  const fieldsByResource: Record<string, Array<{ key: string; label: string; multiline?: boolean; type?: string; placeholder?: string }>> = {
    services: [{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "slug", label: "URL slug" }, { key: "shortDescription", label: "Short description", multiline: true }, { key: "fullDescription", label: "Full description", multiline: true }, { key: "icon", label: "Lucide icon name", placeholder: "Code / Shield / Cpu" }, { key: "features", label: "Sub-features (JSON array)", multiline: true }, { key: "order", label: "Display order", type: "number" }],
    projects: [{ key: "title", label: "Title" }, { key: "client", label: "Client" }, { key: "category", label: "Category" }, { key: "summary", label: "Summary", multiline: true }, { key: "imageUrl", label: "Project Image (Upload from laptop)" }, { key: "metrics", label: "Outcome metric" }, { key: "featured", label: "Featured (1 or 0)", type: "number" }, { key: "order", label: "Display order", type: "number" }],
    portfolio: [{ key: "title", label: "Portfolio title" }, { key: "authorName", label: "Person / author" }, { key: "authorRole", label: "Role" }, { key: "description", label: "Description", multiline: true }, { key: "detailedBio", label: "Detailed Bio / Extended Info", multiline: true }, { key: "additionalImages", label: "Additional Images (JSON array of URLs or uploaded paths)", multiline: true }, { key: "tags", label: "Tags (comma separated)" }, { key: "mediaUrl", label: "Portfolio Media (Upload from laptop)" }, { key: "order", label: "Display order", type: "number" }],
    stats: [{ key: "label", label: "Metric label" }, { key: "value", label: "Value" }, { key: "description", label: "Description", multiline: true }, { key: "icon", label: "Lucide icon name" }, { key: "order", label: "Display order", type: "number" }],
    team: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "bio", label: "Bio", multiline: true }, { key: "avatarUrl", label: "Avatar Photo (Upload from laptop)" }, { key: "skills", label: "Skills (comma separated)" }, { key: "order", label: "Display order", type: "number" }],
    contacts: [{ key: "type", label: "Type (email, phone, address, social)" }, { key: "label", label: "Label / Title" }, { key: "value", label: "Value / URL / Number" }, { key: "order", label: "Display order", type: "number" }],
  };
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-sidebar-brand"><span className="brand-glyph"><span /></span><span className="brand-wordmark">zyvenox<span>lab</span></span></div><div className="admin-sidebar-label">Control room</div><nav>{(Object.keys(resourceLabels) as Resource[]).map((item) => { const Icon = resourceIcons[item]; return <button key={item} className={resource === item ? "active" : ""} onClick={() => selectResource(item)}><Icon size={17} /><span>{resourceLabels[item]}</span>{resource === item && <ChevronRight size={14} />}</button>; })}</nav><div className="admin-sidebar-footer"><a href="/" target="_blank" rel="noreferrer">View public site <ChevronRight size={14} /></a><button onClick={() => logout.mutate()}><LogOut size={16} />Sign out</button></div></aside><main className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">Zyvenox Lab / Admin</span><h1>{resourceLabels[resource]}</h1></div><div className="admin-health"><span className="status-pulse" />Live content system</div></header>{notice && <div className="admin-notice"><Check size={16} />{notice}</div>}{isLoading || (resource === "briefs" && briefsLoading) ? <div className="admin-empty">Loading live content...</div> : resource === "overview" ? <Overview data={data} onSelect={selectResource} /> : resource === "briefs" ? <BriefManagement briefs={briefs ?? []} onUpdate={(id, status, notes) => updateBriefStatus.mutate({ id, status, adminNotes: notes })} /> :     resource === "settings" ? <form className="admin-editor glass-card" onSubmit={submit}><div className="editor-header"><div><span className="eyebrow">Global controls</span><h2>Public site settings &amp; AI chat</h2></div><button className="button button-primary" type="submit"><Save size={16} />Save settings</button></div><div className="editor-grid"><AdminField label="Site title" value={form.siteTitle ?? ""} onChange={(value) => setValue("siteTitle", value)} /><AdminField label="Tagline" value={form.tagline ?? ""} onChange={(value) => setValue("tagline", value)} /><AdminField label="Contact email" value={form.contactEmail ?? ""} onChange={(value) => setValue("contactEmail", value)} type="email" /><AdminField label="Contact phone" value={form.contactPhone ?? ""} onChange={(value) => setValue("contactPhone", value)} /><AdminField label="Address" value={form.address ?? ""} onChange={(value) => setValue("address", value)} /><AdminField label="Social links (JSON)" value={form.socialLinks ?? "{}"} onChange={(value) => setValue("socialLinks", value)} multiline /><AdminField label="Brand description" value={form.description ?? ""} onChange={(value) => setValue("description", value)} multiline /><AdminField label="Chatbot initial greeting" value={form.chatbotGreeting ?? ""} onChange={(value) => setValue("chatbotGreeting", value)} multiline /><AdminField label="Chatbot quick replies (comma separated)" value={form.chatbotQuickReplies ?? ""} onChange={(value) => setValue("chatbotQuickReplies", value)} /></div></form> : <div className="admin-resource-layout"><section className="admin-list glass-card"><div className="editor-header"><div><span className="eyebrow">Live records</span><h2>{resourceLabels[resource]}</h2></div><button className="button button-dark" onClick={() => setEditingId(null)}><Plus size={16} />New</button></div>{(list as any[] | undefined)?.map((item) => <button key={item.id} className={`admin-record ${editingId === item.id ? "selected" : ""}`} onClick={() => setEditingId(item.id)}><span className="record-index">{String(item.order ?? item.id).padStart(2, "0")}</span><span><strong>{item.title ?? item.label ?? item.name ?? item.authorName}</strong><small>{item.category ?? item.role ?? item.value ?? item.authorRole}</small></span><ChevronRight size={15} /></button>)}{(!list || list.length === 0) && <div className="admin-empty">No records yet. Create the first one.</div>}</section><form className="admin-editor glass-card" onSubmit={submit}><div className="editor-header"><div><span className="eyebrow">{editingId ? `Editing record #${editingId}` : "New record"}</span><h2>{editingId ? "Update content" : "Create content"}</h2></div><button className="button button-primary" type="submit"><Save size={16} />{editingId ? "Update" : "Create"}</button></div><div className="editor-grid">{fieldsByResource[resource].map((item) => <div key={item.key}>{item.key === "mediaUrl" || item.key === "avatarUrl" || item.key === "imageUrl" ? <div className="media-upload-group"><label>{item.label}</label><div className="upload-preview-row"><input type="text" readOnly value={form[item.key] ?? ""} placeholder="No file selected yet" /><label className="button button-primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, margin: 0 }}><Upload size={15} />{uploadMutation.isPending ? "Uploading..." : "Upload from laptop"}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file, item.key); }} style={{ display: "none" }} /></label></div>{form[item.key] && <div className="upload-preview-thumb"><img src={form[item.key]} alt="Uploaded preview" style={{ height: 60, marginTop: 8, border: "1px solid var(--line)" }} /></div>}</div> : item.key === "additionalImages" ? <div className="media-upload-group"><label>{item.label}</label><div className="upload-preview-row"><input type="text" value={form[item.key] ?? ""} onChange={(e) => setValue(item.key, e.target.value)} placeholder='["https://...", ...]' /><label className="button button-primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, margin: 0 }}><Upload size={15} />{uploadMutation.isPending ? "Uploading..." : "Add image"}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file, "additionalImages"); }} style={{ display: "none" }} /></label></div></div> : <AdminField label={item.label} value={form[item.key] ?? ""} onChange={(value) => setValue(item.key, value)} multiline={item.multiline} type={item.type} placeholder={item.placeholder} />}</div>)}</div>{editingId && <button type="button" className="delete-button" onClick={() => remove(editingId)}><Trash2 size={15} />Remove record</button>}</form></div>}</main></div>;
}

function BriefManagement({ briefs, onUpdate }: { briefs: any[]; onUpdate: (id: number, status: string, notes: string) => void }) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();
  const replyMutation = trpc.admin.adminBriefReply.useMutation({
    onSuccess: () => {
      alert("Reply sent to client successfully!");
      void utils.admin.clientDirectory.invalidate();
    },
  });

  return (
    <div className="brief-admin-list">
      {briefs.length ? briefs.map((brief) => (
        <article key={brief.id} className="brief-admin-card glass-card" style={{ padding: "28px", marginBottom: 24 }}>
          <div className="brief-admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span className="eyebrow">Brief #{String(brief.id).padStart(4, "0")} · {brief.clientEmail}</span>
              <h2>{brief.projectTitle}</h2>
              <p style={{ margin: "4px 0 0", opacity: 0.8 }}>{brief.clientName} · {brief.serviceCategory}</p>
            </div>
            <span className="brief-status" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(56,189,248,0.1)", color: "var(--accent)", padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
              <span className="status-pulse" />{brief.status}
            </span>
          </div>

          <p className="brief-admin-copy" style={{ marginBottom: 16, lineHeight: 1.6 }}>{brief.briefDescription}</p>

          <div className="brief-admin-meta" style={{ display: "flex", gap: 24, marginBottom: 20, fontSize: "0.85rem", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
            <span><small style={{ display: "block", opacity: 0.6, fontSize: "0.7rem" }}>Budget</small>{brief.estimatedBudget}</span>
            <span><small style={{ display: "block", opacity: 0.6, fontSize: "0.7rem" }}>Timeline</small>{brief.estimatedTimeline}</span>
            <span><small style={{ display: "block", opacity: 0.6, fontSize: "0.7rem" }}>Submitted</small>{new Date(brief.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Client Conversation & Activity Log */}
          <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid var(--line)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.8 }}>Client Chat &amp; Activity Stream</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}>
              <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid var(--line)", fontSize: "0.82rem" }}>
                <strong style={{ display: "block", fontSize: "0.72rem", color: "var(--accent)", marginBottom: 2 }}>{brief.clientName} ({brief.clientEmail})</strong>
                <span>Submitted initial project brief "{brief.projectTitle}"</span>
                <small style={{ display: "block", opacity: 0.5, fontSize: "0.68rem", marginTop: 2 }}>{new Date(brief.createdAt).toLocaleString()}</small>
              </div>
              {brief.activity?.map((act: any) => (
                <div key={act.id} style={{ padding: "8px 12px", background: act.kind === "admin_reply" ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid var(--line)", fontSize: "0.82rem" }}>
                  <strong style={{ display: "block", fontSize: "0.72rem", color: act.kind === "admin_reply" ? "var(--accent)" : "var(--text)", marginBottom: 2 }}>
                    {act.kind === "admin_reply" ? "Zyvenox Lab Administration (Reply)" : act.title}
                  </strong>
                  <span>{act.description}</span>
                  <small style={{ display: "block", opacity: 0.5, fontSize: "0.68rem", marginTop: 2 }}>{new Date(act.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>

            {/* Admin Reply Input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Type a message or reply to client..."
                value={replyTexts[brief.id] ?? ""}
                onChange={(e) => setReplyTexts({ ...replyTexts, [brief.id]: e.target.value })}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: "0.85rem" }}
              />
              <button
                type="button"
                className="button button-primary"
                style={{ padding: "10px 16px", fontSize: "0.82rem" }}
                onClick={() => {
                  const text = replyTexts[brief.id];
                  if (!text || !text.trim()) return;
                  replyMutation.mutate({ briefId: brief.id, replyText: text.trim() });
                  setReplyTexts({ ...replyTexts, [brief.id]: "" });
                }}
              >
                Send Reply
              </button>
            </div>
          </div>

          <div className="brief-admin-actions" style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <label style={{ flex: 1 }}>Status
              <select value={brief.status} onChange={(event) => onUpdate(brief.id, event.target.value, notes[brief.id] ?? brief.adminNotes ?? "")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--line)", marginTop: 4 }}>
                <option>Under Review</option>
                <option>Architectural Review</option>
                <option>In Development</option>
                <option>Completed</option>
              </select>
            </label>
            <label style={{ flex: 2 }}>Private admin note
              <textarea rows={2} value={notes[brief.id] ?? brief.adminNotes ?? ""} onChange={(event) => setNotes({ ...notes, [brief.id]: event.target.value })} placeholder="Add internal note..." style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--line)", marginTop: 4 }} />
            </label>
            <button className="button button-dark" onClick={() => onUpdate(brief.id, brief.status, notes[brief.id] ?? brief.adminNotes ?? "")}><Save size={15} />Save brief update</button>
          </div>
        </article>
      )) : <div className="admin-empty glass-card"><MessageSquareText size={22} />No client briefs yet.</div>}
    </div>
  );
}

function Overview({ data, onSelect }: { data: any; onSelect: (resource: Resource) => void }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmail(searchEmail), 300);
    return () => clearTimeout(timer);
  }, [searchEmail]);
  const { data: stats, isLoading: statsLoading } = trpc.admin.dashboardStats.useQuery();
  const { data: searchResults } = trpc.admin.searchUsersByEmail.useQuery({ email: debouncedEmail }, { enabled: debouncedEmail.trim().length > 0 });
  const cards = [
    { label: "Services", value: data?.services?.length ?? 0, resource: "services" as Resource },
    { label: "Projects", value: data?.projects?.length ?? 0, resource: "projects" as Resource },
    { label: "Portfolio profiles", value: data?.portfolioItems?.length ?? 0, resource: "portfolio" as Resource },
    { label: "Success metrics", value: data?.successStats?.length ?? 0, resource: "stats" as Resource },
  ];
  return (
    <div className="admin-overview">
      <div className="admin-welcome">
        <div>
          <span className="eyebrow">Command center</span>
          <h2>Make the signal clearer.</h2>
          <p>Everything on the public website is editable from this control room. Change content, refine the story, and keep the system current.</p>
        </div>
        <div className="admin-orbit">
          <div>ZY</div>
        </div>
      </div>

      <div className="admin-kpi-grid">
        {cards.map((card) => (
          <button key={card.label} className="admin-kpi glass-card" onClick={() => onSelect(card.resource)}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>Edit collection <ChevronRight size={13} /></small>
          </button>
        ))}
      </div>

      <div className="admin-dashboard-analytics glass-card" style={{ padding: "28px", marginTop: "24px" }}>
        <div className="editor-header" style={{ marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Traffic &amp; Visitor Statistics</span>
            <h3>Real-time platform telemetry</h3>
          </div>
          <span className="status-pulse" />
        </div>
        <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
          <div className="admin-kpi glass-card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span>Monthly Unique Visitors</span>
            <strong>{statsLoading ? "..." : stats?.uniqueVisitors.toLocaleString()}</strong>
            <small style={{ color: "var(--accent)" }}>+18.4% vs last month</small>
          </div>
          <div className="admin-kpi glass-card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span>Page Views (PV)</span>
            <strong>{statsLoading ? "..." : stats?.pageViews.toLocaleString()}</strong>
            <small style={{ color: "var(--accent)" }}>Avg 3.6 per session</small>
          </div>
          <div className="admin-kpi glass-card" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span>Active Client Sessions</span>
            <strong>{statsLoading ? "..." : stats?.activeSessions}</strong>
            <small style={{ color: "var(--accent)" }}>Secure portal active</small>
          </div>
        </div>

        <div className="visitor-chart-container" style={{ marginTop: 24, padding: "20px 16px", background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span className="eyebrow" style={{ fontSize: "0.7rem" }}>30-Day Trend</span>
              <h4 style={{ margin: 0, fontSize: "1rem" }}>Unique Visitors &amp; Page Views over Last 30 Days</h4>
            </div>
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Updated live</span>
          </div>
          <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
            {statsLoading ? (
              <div className="admin-empty" style={{ width: "100%", textAlign: "center", alignSelf: "center" }}>Loading visitor trend telemetry...</div>
            ) : stats?.dailySeries?.length ? (
              stats.dailySeries.map((item: any, idx: number) => {
                const maxVal = Math.max(...stats.dailySeries.map((d: any) => d.visitors), 1);
                const heightPercent = Math.max(12, (item.visitors / maxVal) * 100);
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 }} title={`Day ${item.day}: ${item.visitors.toLocaleString()} visitors, ${item.pageViews.toLocaleString()} PV`}>
                    <div style={{ width: "100%", background: "linear-gradient(180deg, var(--accent) 0%, rgba(56,189,248,0.3) 100%)", height: `${heightPercent}%`, borderRadius: "4px 4px 0 0", transition: "height 0.3s ease" }} />
                    {idx % 5 === 0 && <span style={{ fontSize: "0.65rem", opacity: 0.5, transform: "rotate(-30deg)" }}>D{item.day}</span>}
                  </div>
                );
              })
            ) : (
              <div className="admin-empty" style={{ width: "100%", textAlign: "center", alignSelf: "center" }}>No visitor telemetry data available.</div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "0.8rem", opacity: 0.7 }}>
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-activity glass-card" style={{ padding: "28px", marginTop: "24px" }}>
        <div className="editor-header" style={{ marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Activity Log</span>
            <h3>Recent website &amp; client events</h3>
          </div>
        </div>
        <div className="activity-feed" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {statsLoading ? (
            <div className="admin-empty">Loading activity log...</div>
          ) : stats?.recentActivity?.length ? (
            stats.recentActivity.map((act: any) => (
              <div key={act.id} className="activity-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="status-pulse" style={{ background: "var(--accent)" }} />
                  <div>
                    <strong>{act.title}</strong>
                    <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>{act.description}</p>
                  </div>
                </div>
                <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{act.time}</span>
              </div>
            ))
          ) : (
            <div className="admin-empty">No recent activity recorded yet.</div>
          )}
        </div>
      </div>

      <div className="admin-quick-actions glass-card" style={{ marginTop: 24 }}>
        <div>
          <span className="eyebrow">Quick actions</span>
          <h3>Keep the front door sharp.</h3>
        </div>
        <button onClick={() => onSelect("settings")}><Settings2 size={16} />Edit global settings</button>
        <button onClick={() => onSelect("portfolio")}><ImagePlus size={16} />Manage team portfolio</button>
        <button onClick={() => onSelect("team")}><Users size={16} />Update team profiles</button>
      </div>

      <div className="admin-user-search-card glass-card" style={{ marginTop: 24, padding: "28px" }}>
        <div className="editor-header" style={{ marginBottom: 16 }}>
          <div>
            <span className="eyebrow">Client Directory &amp; Security</span>
            <h3>Registered clients &amp; password reset requests</h3>
          </div>
        </div>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Type client email for autocomplete search..."
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem" }}
          />
          {searchEmail.trim().length > 0 && searchResults && searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, marginTop: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", maxHeight: 220, overflowY: "auto" }}>
              {searchResults.map((user: any) => (
                <div key={user.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.85rem" }}>{user.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</span>
                  </div>
                  <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
          {searchEmail.trim().length > 0 && searchResults && searchResults.length === 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, marginTop: 4, padding: 12, textAlign: "center", fontSize: "0.8rem", color: "var(--text-faint)" }}>
              No clients matching "{searchEmail}"
            </div>
          )}
        </div>

        <ClientDirectoryTable />
      </div>
    </div>
  );
}

function ClientDirectoryTable() {
  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.admin.clientDirectory.useQuery();
  const updateStatus = trpc.admin.updateClientStatus.useMutation({
    onSuccess: () => void utils.admin.clientDirectory.invalidate(),
  });
  const sendReset = trpc.admin.adminSendResetEmail.useMutation({
    onSuccess: (res) => alert(res.message),
  });
  const deleteClient = trpc.admin.deleteClient.useMutation({
    onSuccess: () => void utils.admin.clientDirectory.invalidate(),
  });

  if (isLoading) return <div className="admin-empty" style={{ padding: 20 }}>Loading registered clients directory...</div>;
  if (!clients || clients.length === 0) return <div className="admin-empty" style={{ padding: 20 }}>No registered clients found in the database.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <th style={{ padding: "10px 12px" }}>Client Username / Name</th>
            <th style={{ padding: "10px 12px" }}>Email Address</th>
            <th style={{ padding: "10px 12px" }}>Company</th>
            <th style={{ padding: "10px 12px" }}>Status</th>
            <th style={{ padding: "10px 12px" }}>Reset Requests</th>
            <th style={{ padding: "10px 12px" }}>Admin Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c: any) => (
            <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "12px", fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: "12px", color: "var(--accent)" }}>{c.email}</td>
              <td style={{ padding: "12px", opacity: 0.8 }}>{c.company || "Independent"}</td>
              <td style={{ padding: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.status === "suspended" ? "rgba(237,140,140,0.1)" : "rgba(81,207,102,0.1)", color: c.status === "suspended" ? "#ed8c8c" : "#51cf66", padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }}>
                  {c.status || "active"}
                </span>
              </td>
              <td style={{ padding: "12px" }}>
                {c.hasRequestedReset ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(240,180,41,0.1)", color: "#f0b429", padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>
                    Requested ({c.resetCount})
                  </span>
                ) : (
                  <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>None</span>
                )}
              </td>
              <td style={{ padding: "12px", display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="button button-ghost"
                  style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                  onClick={() => sendReset.mutate({ clientId: c.id })}
                  title="Send password reset email"
                >
                  Send Reset Email
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  style={{ padding: "4px 8px", fontSize: "0.7rem", color: c.status === "suspended" ? "#51cf66" : "#ed8c8c" }}
                  onClick={() => updateStatus.mutate({ clientId: c.id, status: c.status === "suspended" ? "active" : "suspended" })}
                >
                  {c.status === "suspended" ? "Activate" : "Suspend"}
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  style={{ padding: "4px 8px", fontSize: "0.7rem", color: "#fa5252" }}
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete client ${c.name} (${c.email})?`)) {
                      deleteClient.mutate({ clientId: c.id });
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
