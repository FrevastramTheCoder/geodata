import { Link } from "react-router-dom";
import { Globe2, ShieldCheck } from "lucide-react";

export default function Profile() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="card p-8">
        <div className="flex items-center gap-4"><Globe2 className="h-12 w-12 text-brand-600" /><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Frontend account model</p><h1 className="mt-1 text-3xl font-black text-gray-900">No account required</h1></div></div>
        <p className="mt-6 text-sm leading-relaxed text-gray-600">The public catalogue does not collect identity data. Saved resources are stored locally in your browser and official providers handle their own access and registration.</p>
        <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-950"><ShieldCheck className="mr-2 inline h-4 w-4" />External links open in a new tab and remain controlled by the official provider.</div>
        <Link to="/dashboard" className="btn-primary mt-6">Open workspace</Link>
      </div>
    </div>
  );
}
