import { Link } from "react-router-dom";
import { Bookmark, Database, ExternalLink, Layers, Monitor } from "lucide-react";
import { getSavedResources } from "../services/localState.js";

export default function Dashboard() {
  const saved = getSavedResources();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-brand-950 p-8 text-white sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">Your local workspace</p>
        <h1 className="mt-2 text-3xl font-black">Welcome to your geospatial workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">This frontend-only workspace keeps saved links in this browser. No registration or database is required.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Bookmark} label="Saved resources" value={saved.length} />
        <Stat icon={Database} label="Dataset catalogue" value="External" />
        <Stat icon={Monitor} label="Software catalogue" value="External" />
      </div>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/data" className="card p-6 transition hover:border-brand-400"><Database className="h-6 w-6 text-brand-600" /><h2 className="mt-4 font-bold text-gray-900">Explore datasets</h2><p className="mt-1 text-sm text-gray-600">Browse official data links and Earth Engine collections.</p></Link>
        <Link to="/software" className="card p-6 transition hover:border-brand-400"><Layers className="h-6 w-6 text-brand-600" /><h2 className="mt-4 font-bold text-gray-900">Explore software</h2><p className="mt-1 text-sm text-gray-600">Find official developer pages and download links.</p></Link>
        <a href="https://developers.google.com/earth-engine/datasets/catalog" target="_blank" rel="noreferrer" className="card p-6 transition hover:border-brand-400"><ExternalLink className="h-6 w-6 text-brand-600" /><h2 className="mt-4 font-bold text-gray-900">Open Earth Engine</h2><p className="mt-1 text-sm text-gray-600">Open the complete official Google catalog.</p></a>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="card flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></div><div><div className="text-xl font-black text-gray-900">{value}</div><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div></div></div>;
}
