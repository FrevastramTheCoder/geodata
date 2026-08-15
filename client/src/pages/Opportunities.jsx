import { useEffect, useState } from "react";
import { ExternalLink, Heart, Search, Sparkles } from "lucide-react";
import { listOpportunities } from "../services/opportunitiesApi.js";
import { getSavedResources, toggleSaved } from "../services/localState.js";

const CATEGORIES = [
  "Jobs",
  "GIS Jobs",
  "Remote GIS Jobs",
  "Internships",
  "Scholarships",
  "Fellowships",
  "Research Opportunities",
  "Training Opportunities",
  "Conferences",
  "Competitions",
  "Freelance Opportunities",
];

export default function Opportunities() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    listOpportunities({ q, category }).then(setItems);
    setSaved(new Set(getSavedResources().filter((item) => item.resourceType === "OPPORTUNITY").map((item) => item.resourceId)));
  }, [category]);

  function search(event) {
    event.preventDefault();
    listOpportunities({ q, category }).then(setItems);
  }

  function save(item) {
    toggleSaved("OPPORTUNITY", item.id);
    setSaved(new Set(getSavedResources().filter((savedItem) => savedItem.resourceType === "OPPORTUNITY").map((savedItem) => savedItem.resourceId)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-3xl">
        <span className="badge bg-brand-50 text-brand-700"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> GeoBrains Opportunities</span>
        <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Find the next geospatial opportunity.</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">Official jobs, remote GIS roles, internships, scholarships, research opportunities, conferences, competitions and training links. Saved opportunities stay in this browser.</p>
      </div>
      <form onSubmit={search} className="card mt-7 grid gap-3 p-4 md:grid-cols-[1fr_260px_auto]">
        <label className="relative"><span className="sr-only">Search opportunities</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input className="input pl-9" placeholder="Search jobs, scholarships, GeoAI..." value={q} onChange={(event) => setQ(event.target.value)} /></label>
        <label><span className="sr-only">Opportunity category</span><select className="input" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All opportunity types</option>{CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
        <button className="btn-primary justify-center">Search opportunities</button>
      </form>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map((item) => <article key={item.id} className="card p-5"><div className="flex items-start justify-between gap-3"><div><span className="badge bg-brand-50 text-brand-700">{item.category}</span><h2 className="mt-2 text-lg font-bold text-gray-900">{item.title}</h2><p className="mt-1 text-sm text-gray-500">{item.organization}</p></div><button type="button" onClick={() => save(item)} className={`rounded-lg p-2 ${saved.has(item.id) ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`} aria-label={saved.has(item.id) ? "Remove saved opportunity" : "Save opportunity"}><Heart className="h-4 w-4" fill={saved.has(item.id) ? "currentColor" : "none"} aria-hidden="true" /></button></div><p className="mt-4 text-sm leading-relaxed text-gray-600">{item.description}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5">Visit official source <ExternalLink className="h-4 w-4" aria-hidden="true" /></a></article>)}
        {!items.length && <div className="card col-span-full p-10 text-center"><h2 className="text-lg font-bold text-gray-900">No opportunities found</h2><p className="mt-1 text-sm text-gray-600">Try a broader search or another category. The public registry remains usable when an optional external feed is unavailable.</p></div>}
      </div>
    </div>
  );
}
