import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, Send } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta.js";

const initialForm = {
  name: "",
  officialWebsite: "",
  downloadUrl: "",
  category: "",
  description: "",
  submitterName: "",
  submitterEmail: "",
};

export default function SoftwareSubmit() {
  usePageMeta("Suggest Software", "Suggest a GIS, remote sensing, CAD or BIM tool for the GEO SOFTWARE HUB.");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      const suggestions = JSON.parse(localStorage.getItem("geodata-hub-software-suggestions") || "[]");
      suggestions.push({ ...form, status: "PENDING_REVIEW", createdAt: new Date().toISOString() });
      localStorage.setItem("geodata-hub-software-suggestions", JSON.stringify(suggestions));
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="card p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-2xl font-black text-gray-900">Thanks for the suggestion</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            <span className="font-semibold">{form.name}</span> is now in the review queue.
            An editor will check the official links and publish it — with a verification badge.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/software" className="btn-primary">Back to the hub</Link>
            <button onClick={() => { setForm(initialForm); setSent(false); }} className="btn-secondary">
              Suggest another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <span className="badge bg-brand-50 text-brand-700"><Send className="h-3.5 w-3.5" /> Community-driven</span>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Suggest Software</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Know a geospatial tool missing from the hub? Suggest it and an editor will review the
        official links, verify them, and publish it. Please only suggest software with an
        official website — we never list third-party mirrors.
      </p>

      <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="label">Software name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. SAGA GIS"
            className="input"
          />
        </div>
        <div>
          <label className="label">Official website *</label>
          <input
            required
            type="url"
            value={form.officialWebsite}
            onChange={(e) => set("officialWebsite", e.target.value)}
            placeholder="https://saga-gis.sourceforge.io/"
            className="input"
          />
        </div>
        <div>
          <label className="label">Official download page</label>
          <input
            type="url"
            value={form.downloadUrl}
            onChange={(e) => set("downloadUrl", e.target.value)}
            placeholder="https://.../downloads (optional)"
            className="input"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="e.g. GIS Software, Remote Sensing..."
            className="input"
          />
        </div>
        <div>
          <label className="label">Why is it useful?</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does it do? Who is it for? (optional)"
            className="input"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Your name</label>
            <input value={form.submitterName} onChange={(e) => set("submitterName", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Your email</label>
            <input type="email" value={form.submitterEmail} onChange={(e) => set("submitterEmail", e.target.value)} className="input" />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
          <p className="flex items-start gap-1.5 text-xs text-gray-500">
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Submissions become PENDING_REVIEW and are published only after link verification.
          </p>
          <button type="submit" className="btn-primary">Submit suggestion</button>
        </div>
      </form>
    </div>
  );
}
