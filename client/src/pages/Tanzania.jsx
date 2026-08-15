import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getDatasetCategories } from "../services/datasetsApi.js";
import { CategoryIcon, Loading, ErrorState } from "../components/ui.jsx";

const TANZANIA_SECTIONS = [
  { title: "Administrative", category: "administrative-boundaries", desc: "Regions, districts, wards and enumeration areas" },
  { title: "Planning", category: "urban-regional-planning", desc: "Master plans, zoning and development control" },
  { title: "Environment", category: "environment", desc: "Biodiversity, conservation and monitoring" },
  { title: "Climate", category: "climate-weather", desc: "Climate, weather, rainfall and temperature" },
  { title: "Population", category: "population-demographics", desc: "Census and demographic statistics" },
  { title: "Transport", category: "transport-infrastructure", desc: "Roads, railways, airports and ports" },
  { title: "Remote Sensing", category: "satellite-remote-sensing", desc: "Satellite imagery and earth observation" },
  { title: "Agriculture", category: "agriculture", desc: "Crops, livestock and food security" },
  { title: "Disaster Risk", category: "disaster-risk", desc: "Flood, drought and hazard data" },
  { title: "Land", category: "cadastral-land", desc: "Cadastre, tenure and land administration" },
  { title: "Water", category: "hydrology", desc: "Rivers, lakes and water resources" },
  { title: "Infrastructure", category: "buildings", desc: "Buildings and built environment" },
];

export default function Tanzania() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getDatasetCategories()
      .then((c) => alive && setCategories(c))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading Tanzania data..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
          <MapPin className="h-7 w-7 text-brand-600" /> Tanzania
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Geospatial data for Tanzania by topic. Every record links to its
          original official source.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TANZANIA_SECTIONS.map((s) => {
          const cat = bySlug.get(s.category);
          const count = cat?._count?.datasets || 0;
          return (
            <Link
              key={s.title}
              to={`/explore?category=${s.category}`}
              className="card group p-5 transition hover:border-brand-400 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ backgroundColor: `${cat?.color || "#1c9e62"}1a`, color: cat?.color || "#1c9e62" }}
                >
                  <CategoryIcon icon={cat?.icon} className="text-lg" />
                </div>
                <span className="badge bg-brand-50 text-brand-700">{count} datasets</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 group-hover:text-brand-700">{s.title}</h2>
              <p className="mt-0.5 text-sm text-gray-600">{s.desc}</p>
            </Link>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Nationally relevant data</h2>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-600">
          The Tanzania section covers national and subnational resources:
          administrative boundaries from NBS censuses, land and planning
          data, climate and hydrological records, and infrastructure
          networks — plus global datasets (NASA, USGS, ESA/Copernicus, FAO,
          World Bank, WorldPop, OSM, HDX) that cover Tanzania.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/explore?q=administrative boundaries" className="btn-secondary">Administrative boundaries</Link>
          <Link to="/explore?q=Tanzania DEM" className="btn-secondary">DEM & terrain</Link>
          <Link to="/explore?q=land cover" className="btn-secondary">Land cover</Link>
          <Link to="/explore?q=population" className="btn-secondary">Population & census</Link>
          <Link to="/explore?q=roads" className="btn-secondary">Roads & transport</Link>
          <Link to="/explore?q=flood" className="btn-secondary">Flood risk</Link>
          <Link to="/explore?coverage=Zanzibar" className="btn-secondary">Zanzibar</Link>
        </div>
      </section>
    </div>
  );
}
