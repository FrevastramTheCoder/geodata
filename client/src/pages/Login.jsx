import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import BrandLogo from "../components/BrandLogo.jsx";

export default function Login() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="card w-full p-8 text-center">
        <BrandLogo className="mx-auto mb-4 h-24 w-24" priority />
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Public geospatial catalogue</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Accounts are not required. Browse datasets, software and official provider resources directly.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/data" className="btn-primary justify-center">Explore data</Link>
          <a href="https://developers.google.com/earth-engine/datasets/catalog" target="_blank" rel="noreferrer" className="btn-secondary justify-center">
            Google Earth Engine catalog <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
