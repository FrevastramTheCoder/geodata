import { Link } from "react-router-dom";
import { Globe2, Satellite, Mountain, Droplets, Users, Route } from "lucide-react";

const PROVIDERS = [
  { name: "NASA", desc: "Earth observation via CMR metadata search", icon: Satellite, color: "#1f2937" },
  { name: "USGS", desc: "Geology, water and elevation via ScienceBase", icon: Mountain, color: "#92400e" },
  { name: "ESA / Copernicus", desc: "Sentinel satellite data via STAC API", icon: Satellite, color: "#1d4ed8" },
  { name: "FAO", desc: "Land use, land cover and agriculture statistics", icon: Droplets, color: "#047857" },
  { name: "World Bank", desc: "Development indicators for Tanzania", icon: Globe2, color: "#0369a1" },
  { name: "WorldPop", desc: "100m gridded population estimates", icon: Users, color: "#7c3aed" },
  { name: "OpenStreetMap", desc: "Extracts via the Geofabrik catalogue", icon: Route, color: "#16a34a" },
  { name: "HDX", desc: "Humanitarian datasets via CKAN API", icon: Globe2, color: "#ea580c" },
];

export default function Global() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Global & Africa</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-600">
        International datasets relevant to Tanzania and East Africa from
        trusted global providers.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((p) => (
          <div key={p.name} className="card p-5 transition hover:border-brand-400 hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: p.color }}
              >
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{p.name}</h2>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Datasets covering Tanzania and East Africa are integrated into
              the catalogue through automated source connectors.
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12 card p-6">
        <h2 className="text-lg font-bold text-gray-900">Browse global data</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/explore?source=nasa" className="btn-secondary">NASA datasets</Link>
          <Link to="/explore?source=usgs" className="btn-secondary">USGS datasets</Link>
          <Link to="/explore?source=copernicus" className="btn-secondary">Copernicus datasets</Link>
          <Link to="/explore?source=fao" className="btn-secondary">FAO datasets</Link>
          <Link to="/explore?source=worldbank" className="btn-secondary">World Bank datasets</Link>
          <Link to="/explore?source=worldpop" className="btn-secondary">WorldPop datasets</Link>
          <Link to="/explore?source=osm" className="btn-secondary">OpenStreetMap</Link>
          <Link to="/explore?source=hdx" className="btn-secondary">HDX datasets</Link>
        </div>
      </section>
    </div>
  );
}