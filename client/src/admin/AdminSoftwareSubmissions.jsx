import { useEffect, useState } from "react";
import { Check, ExternalLink, Trash2, X } from "lucide-react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

export default function AdminSoftwareSubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await api.adminSoftware.submissions());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(sub, action) {
    setBusy((b) => ({ ...b, [sub.id]: true }));
    setError("");
    try {
      if (action === "APPROVED") {
        await api.adminSoftware.approveSubmission(sub.id);
        setNotice(`"${sub.name}" approved and added to the catalogue — verify its links next.`);
      } else {
        await api.adminSoftware.rejectSubmission(sub.id, notes[sub.id] || "");
        setNotice(`"${sub.name}" rejected.`);
      }
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((b) => ({ ...b, [sub.id]: false }));
    }
  }

  async function remove(sub) {
    if (!window.confirm(`Delete submission "${sub.name}"?`)) return;
    try {
      await api.adminSoftware.removeSubmission(sub.id);
      setNotice("Submission removed.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loading label="Loading submissions..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Software Submissions</h1>
      <p className="mt-1 text-sm text-gray-600">
        Public suggestions from the "Suggest Software" page. Approving adds the title to the
        catalogue as PUBLISHED with UNKNOWN verification — then verify its links.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      {items.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sm text-gray-500">
          No submissions yet — the queue is empty.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((sub) => (
            <div key={sub.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">{sub.name}</h2>
                    <span className={`badge ${sub.status === "APPROVED" ? "bg-green-100 text-green-800" : sub.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {sub.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {sub.submitterName || "Anonymous"} · {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={sub.officialWebsite} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> Official site
                  </a>
                  {sub.downloadUrl && (
                    <a href={sub.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>
              {sub.description && <p className="mt-3 text-sm text-gray-600">{sub.description}</p>}
              {sub.category && (
                <p className="mt-2 text-xs text-gray-500">Suggested category: <span className="font-semibold">{sub.category}</span></p>
              )}
              {sub.status === "PENDING_REVIEW" && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                  <input
                    value={notes[sub.id] || ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [sub.id]: e.target.value }))}
                    placeholder="Rejection reason (optional)"
                    className="input w-72"
                  />
                  <button onClick={() => act(sub, "APPROVED")} disabled={busy[sub.id]} className="btn-primary px-4 py-2 text-xs">
                    <Check className="h-3.5 w-3.5" /> Approve &amp; add
                  </button>
                  <button onClick={() => act(sub, "REJECTED")} disabled={busy[sub.id]} className="btn-secondary px-4 py-2 text-xs text-red-700">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button onClick={() => remove(sub)} className="rounded-lg p-2 text-gray-400 hover:text-red-600" title="Delete submission">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}