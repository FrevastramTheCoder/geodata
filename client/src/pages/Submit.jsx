import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";

const CATEGORY_OPTIONS = [
  "administrative-boundaries",
  "urban-regional-planning",
  "land-use-land-cover",
  "satellite-remote-sensing",
  "dem-terrain",
  "climate-weather",
  "hydrology",
  "soil-geology",
  "agriculture",
  "population-demographics",
  "health",
  "education",
  "transport-infrastructure",
  "buildings",
  "cadastral-land",
  "environment",
  "marine-coastal",
  "disaster-risk",
  "gis-tools-services",
  "other",
];

export default function Submit() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    source: "",
    category: "",
    coverage: "Tanzania",
    year: "",
    officialUrl: "",
    directUrl: "",
    submitterName: "",
    submitterEmail: "",
  });
  const [status, setStatus] = useState(null); // null | submitting | done | error
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const submissions = JSON.parse(localStorage.getItem("geodata-hub-submissions") || "[]");
      submissions.push({
        ...form,
        year: form.year ? Number(form.year) : null,
        dataType: "Web / Catalog",
        format: "Web",
        license: "See official source",
        accessType: "PUBLIC_DOWNLOAD",
      });
      localStorage.setItem("geodata-hub-submissions", JSON.stringify(submissions));
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Thank you!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your submission has been received and is now in{" "}
          <strong>pending review</strong>. Our team will verify the link and
          metadata before it appears in the catalogue.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/explore" className="btn-primary">Browse the catalogue</Link>
          <button onClick={() => { setStatus(null); setForm({ ...form, name: "", description: "", officialUrl: "" }); }} className="btn-secondary">
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Submit a Dataset</h1>
      <p className="mt-2 text-sm text-gray-600">
        Know a geospatial resource that belongs in the catalogue? Submit it
        for review. Submissions are never auto-published.
      </p>

      <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="label" htmlFor="name">Dataset name *</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Tanzania Road Network 2022"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What does this dataset contain?"
            className="input resize-y"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="source">Source organization</label>
            <input
              id="source"
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
              placeholder="e.g. TANROADS"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="input"
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="coverage">Coverage</label>
            <input
              id="coverage"
              value={form.coverage}
              onChange={(e) => update("coverage", e.target.value)}
              placeholder="e.g. Tanzania"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="year">Year</label>
            <input
              id="year"
              type="number"
              min={1900}
              max={2100}
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              placeholder="e.g. 2022"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="officialUrl">Official source URL *</label>
          <input
            id="officialUrl"
            required
            type="url"
            value={form.officialUrl}
            onChange={(e) => update("officialUrl", e.target.value)}
            placeholder="https://..."
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="directUrl">Direct access / download URL (optional)</label>
          <input
            id="directUrl"
            type="url"
            value={form.directUrl}
            onChange={(e) => update("directUrl", e.target.value)}
            placeholder="https://..."
            className="input"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="submitterName">Your name (optional)</label>
            <input
              id="submitterName"
              value={form.submitterName}
              onChange={(e) => update("submitterName", e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="submitterEmail">Email (optional)</label>
            <input
              id="submitterEmail"
              type="email"
              value={form.submitterEmail}
              onChange={(e) => update("submitterEmail", e.target.value)}
              className="input"
            />
          </div>
        </div>

        {status === "error" && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {status === "submitting" ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
