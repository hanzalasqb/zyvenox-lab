import { useState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Download, FileText, LogOut, MessageSquareText, ShieldCheck, Trash2, Upload, UserRound } from "lucide-react";
import { Link } from "wouter";
import SeoHead from "@/components/SeoHead";
import { trpc } from "@/lib/trpc";

const statuses = ["Under Review", "Architectural Review", "In Development", "Completed"];

function StatusTracker({ status }: { status: string }) {
  const current = Math.max(0, statuses.indexOf(status));
  return <div className="brief-tracker">{statuses.map((item, index) => <div key={item} className={`brief-step ${index <= current ? "complete" : ""} ${item === status ? "current" : ""}`}><span>{index < current ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}</span><small>{item}</small></div>)}</div>;
}

function MilestoneProgress({ status }: { status: string }) {
  const current = Math.max(0, statuses.indexOf(status));
  const percent = Math.round((current / (statuses.length - 1)) * 100);
  return <div className="brief-progress-panel"><div className="brief-progress-heading"><div><span className="eyebrow">Delivery signal</span><strong>{percent}% through the milestone path</strong></div><span className="progress-value">{percent}%</span></div><div className="brief-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`Project progress: ${percent}%`}><span style={{ width: `${Math.max(8, percent)}%` }} /></div><div className="brief-progress-caption"><span>Current phase</span><strong>{status}</strong></div></div>;
}

function ActivityLog({ brief }: { brief: any }) {
  const events = brief.activity?.length ? brief.activity : [{ kind: "submitted", title: "Project brief submitted", description: "Your brief is now in the Zyvenox Lab delivery queue.", createdAt: brief.createdAt }];
  return <div className="brief-activity"><div className="brief-activity-heading"><div><span className="eyebrow">Signal trail</span><strong>Recent activity</strong></div><Activity size={18} /></div><ol>{events.slice(0, 4).map((event: any, index: number) => <li key={event.id ?? `${event.kind}-${index}`}><span className={`activity-marker ${index === 0 ? "active" : ""}`} /><div><strong>{event.title}</strong><p>{event.description}</p><time dateTime={new Date(event.createdAt).toISOString()}>{new Date(event.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time></div></li>)}</ol></div>;
}

function AssetUploader() {
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();
  const { data: assets, isLoading } = trpc.clientPortal.assets.useQuery();
  const uploadMutation = trpc.clientPortal.uploadAsset.useMutation({
    onSuccess: () => {
      setUploading(false);
      void utils.clientPortal.assets.invalidate();
    },
    onError: () => setUploading(false),
  });
  const deleteMutation = trpc.clientPortal.deleteAsset.useMutation({
    onSuccess: () => void utils.clientPortal.assets.invalidate(),
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("File size exceeds 25MB limit.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result;
      uploadMutation.mutate({
        fileName: file.name,
        fileBase64: base64,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <section className="client-assets-section">
      <div className="portal-section-heading" style={{ marginTop: 60 }}>
        <div>
          <span className="eyebrow">Project vault</span>
          <h2>Secure asset uploads</h2>
        </div>
        <span className="portal-secure-label"><ShieldCheck size={14} /> Encrypted at rest</span>
      </div>
      <div className="glass-card contact-form" style={{ padding: 25 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 15, marginBottom: 20 }}>
          <div>
            <strong>Share architectures, specs, or datasets</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: "4px 0 0" }}>Accepted formats: PDF, ZIP, PNG, JSON, MD (Max 20MB)</p>
          </div>
          <label className="button button-primary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, margin: 0 }}>
            <Upload size={15} /> {uploading ? "Uploading..." : "Select asset"}
            <input type="file" style={{ display: "none" }} onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>
        {isLoading ? (
          <div style={{ color: "var(--text-faint)", fontSize: "0.74rem" }}>Loading uploaded assets...</div>
        ) : assets?.length ? (
          <div className="asset-list" style={{ display: "grid", gap: 10 }}>
            {assets.map((asset: any) => (
              <div key={asset.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--bg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <FileText size={18} style={{ color: "var(--accent)", flex: "none" }} />
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.fileName}</strong>
                    <span style={{ color: "var(--text-faint)", fontSize: "0.62rem" }}>{(asset.fileSize / 1024).toFixed(1)} KB · {new Date(asset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
                  <a href={asset.fileUrl} download={asset.fileName} className="button button-ghost" style={{ padding: "6px 10px", fontSize: "0.7rem" }} title="Download">
                    <Download size={14} />
                  </a>
                  <button type="button" className="button button-ghost" style={{ padding: "6px 10px", color: "#ed8c8c", fontSize: "0.7rem" }} onClick={() => deleteMutation.mutate({ id: asset.id })} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-faint)", fontSize: "0.76rem" }}>
            No assets uploaded yet. Use the button above to securely share documents with your engineering pod.
          </div>
        )}
      </div>
    </section>
  );
}

function PortalAuth() {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", company: "" });
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.clientPortal.login.useMutation({ onSuccess: ({ token }) => { sessionStorage.setItem("zyvenox-client-token", token); void utils.clientPortal.me.invalidate(); }, onError: (err) => setError(err.message) });
  const register = trpc.clientPortal.register.useMutation({ onSuccess: ({ token }) => { sessionStorage.setItem("zyvenox-client-token", token); void utils.clientPortal.me.invalidate(); }, onError: (err) => setError(err.message) });
  const requestReset = trpc.clientPortal.requestPasswordReset.useMutation({
    onSuccess: (res) => {
      setSuccessMsg("Successful! Please check your email for reset instructions.");
      if (res.debugToken) {
        setResetToken(res.debugToken);
        setMode("reset");
      }
    },
    onError: (err) => setError(err.message),
  });
  const resetPass = trpc.clientPortal.resetPassword.useMutation({
    onSuccess: () => {
      setSuccessMsg("Password updated successfully! You can now sign in.");
      setMode("login");
      setNewPassword("");
    },
    onError: (err) => setError(err.message),
  });

  const getStrength = (pwd: string) => {
    if (!pwd) return { label: "", score: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: "Weak", score: 1, color: "#ed8c8c" };
    if (score === 2 || score === 3) return { label: "Moderate", score: 2, color: "#f0b429" };
    return { label: "Strong", score: 3, color: "#51cf66" };
  };
  const strength = getStrength(form.password || newPassword);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    if (mode === "login") login.mutate({ email: form.email, password: form.password });
    else if (mode === "register") register.mutate(form);
    else if (mode === "forgot") requestReset.mutate({ email: form.email });
    else if (mode === "reset") resetPass.mutate({ token: resetToken, newPassword });
  };

  return (
    <main className="portal-auth">
      <div className="portal-auth-card glass-card">
        <div className="portal-auth-icon"><ShieldCheck size={24} /></div>
        <span className="eyebrow">Zyvenox Lab / Client portal</span>
        <h1>Keep the work <em>moving.</em></h1>
        <p>Sign in to see your submitted briefs, current delivery phase, and encrypted client assets.</p>
        
        <div className="portal-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}>Sign in</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}>Create account</button>
        </div>

        {successMsg && <div style={{ background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.3)", color: "#51cf66", padding: "10px 14px", fontSize: "0.8rem", marginBottom: 15 }}>{successMsg}</div>}
        {error && <div className="form-error" style={{ marginBottom: 15 }}>{error}</div>}

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sarah Jenkins" /></label>
              <label>Company <span>(optional)</span><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Apex Financial" /></label>
            </>
          )}

          {mode !== "reset" && (
            <label>Work email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
          )}

          {mode === "forgot" && (
            <button type="submit" className="button button-primary" disabled={requestReset.isPending}>
              {requestReset.isPending ? "Sending reset token..." : "Send reset instructions"} <ArrowUpRight size={16} />
            </button>
          )}

          {mode === "reset" && (
            <>
              <label>Reset Token<input required value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Paste secure reset token" /></label>
              <label>New Password<input required minLength={6} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" /></label>
              {newPassword && (
                <div style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px" }}>
                  <span>Password strength:</span>
                  <strong style={{ color: strength.color }}>{strength.label}</strong>
                </div>
              )}
              <button type="submit" className="button button-primary" disabled={resetPass.isPending}>
                {resetPass.isPending ? "Updating password..." : "Reset password"} <ArrowUpRight size={16} />
              </button>
            </>
          )}

          {(mode === "login" || mode === "register") && (
            <>
              <label>
                Password
                <input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
              </label>
              {form.password && (
                <div style={{ fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
                  <span>Strength:</span>
                  <strong style={{ color: strength.color }}>{strength.label}</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 12px", fontSize: "0.75rem" }}>
                {mode === "login" && (
                  <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <button type="submit" className="button button-primary" disabled={login.isPending || register.isPending}>
                {login.isPending || register.isPending ? "Authenticating..." : mode === "login" ? "Open portal" : "Create secure account"} <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </form>

        {mode === "forgot" && (
          <button type="button" onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }} className="button button-ghost" style={{ width: "100%", marginTop: 12, fontSize: "0.75rem" }}>
            Back to sign in
          </button>
        )}

        <Link href="/contact" className="portal-back-link">Need to submit a new brief? Start at the estimator <ArrowUpRight size={14} /></Link>
      </div>
    </main>
  );
}

export default function ClientPortal() {
  const { data: session, isLoading: loadingSession } = trpc.clientPortal.me.useQuery();
  const { data: briefs, isLoading: loadingBriefs } = trpc.clientPortal.myBriefs.useQuery(undefined, { enabled: Boolean(session) });
  const utils = trpc.useUtils();
  const logout = trpc.clientPortal.logout.useMutation({ onSuccess: () => { sessionStorage.removeItem("zyvenox-client-token"); void utils.clientPortal.me.invalidate(); } });
  if (loadingSession) return <main className="portal-loading"><div className="loader-orbit" /><span>Opening secure portal...</span></main>;
  if (!session) return <><SeoHead title="Client portal | Track your Zyvenox Lab engagement" description="Securely log in to the Zyvenox Lab client portal to track submitted project briefs and delivery status." path="/portal" noIndex schema={{ "@type": "WebPage", name: "Zyvenox Lab client portal", isPartOf: { "@id": "https://zyvenoxlab.com/#website" } }} /><PortalAuth /></>;
  return <><SeoHead title="Client portal dashboard | Zyvenox Lab" description="Track your active Zyvenox Lab project briefs, delivery status, planning range, and next steps." path="/portal" noIndex schema={{ "@type": "WebPage", name: "Zyvenox Lab client dashboard", isPartOf: { "@id": "https://zyvenoxlab.com/#website" } }} /><main className="portal-dashboard"><div className="container"><header className="portal-header"><div><span className="eyebrow">Client portal / Secure workspace</span><h1>Good to see you, <em>{session.name.split(" ")[0]}.</em></h1><p>Your project briefs and delivery signals in one place.</p></div><button className="button button-ghost" onClick={() => logout.mutate()}><LogOut size={15} />Sign out</button></header><div className="portal-summary"><div><span className="portal-summary-icon"><UserRound size={18} /></span><small>Authenticated as</small><strong>{session.email}</strong></div><div><span className="portal-summary-icon"><MessageSquareText size={18} /></span><small>Active briefs</small><strong>{briefs?.length ?? 0}</strong></div><Link href="/contact" className="button button-primary">Submit another brief <ArrowUpRight size={15} /></Link></div>{loadingBriefs ? <div className="portal-loading inline"><div className="loader-orbit" /><span>Loading project signals...</span></div> : <section className="brief-list"><div className="portal-section-heading"><div><span className="eyebrow">Your workstream</span><h2>Project briefs</h2></div><span className="portal-secure-label"><ShieldCheck size={14} />Private to your account</span></div>{briefs?.length ? briefs.map((brief: any) => <article key={brief.id} className="brief-card glass-card"><div className="brief-card-header"><div><span className="eyebrow">Brief #{String(brief.id).padStart(4, "0")} · {brief.serviceCategory}</span><h3>{brief.projectTitle}</h3></div><span className="brief-status"><span className="status-pulse" />{brief.status}</span></div><p>{brief.briefDescription}</p><div className="brief-meta"><span><small>Planning range</small>{brief.estimatedBudget}</span><span><small>Timeline</small>{brief.estimatedTimeline}</span><span><small>Submitted</small>{new Date(brief.createdAt).toLocaleDateString()}</span></div><StatusTracker status={brief.status} /><div className="brief-insights"><MilestoneProgress status={brief.status} /><ActivityLog brief={brief} /></div>{brief.adminNotes && <div className="brief-note"><FileText size={16} /><span><strong>Latest note from Zyvenox Lab</strong>{brief.adminNotes}</span></div>}</article>) : <div className="portal-empty"><FileText size={25} /><h2>No briefs yet.</h2><p>When you submit a project brief from the estimator, it will appear here with live status updates.</p><Link href="/contact" className="button button-primary">Use the estimator <ArrowUpRight size={15} /></Link></div>}</section>}
<AssetUploader /></div></main></>;
}
