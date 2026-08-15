import { Link } from "react-router-dom";
import { Award, ExternalLink } from "lucide-react";

export default function Certificates() {
  return <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6"><Award className="mx-auto h-14 w-14 text-brand-600" /><h1 className="mt-5 text-3xl font-black text-gray-900">Certificates</h1><p className="mt-3 text-sm leading-relaxed text-gray-600">Certificates are issued and verified by the organization that provides the course. This public catalogue does not store learner accounts or certificates.</p><a href="https://developers.google.com/earth-engine" target="_blank" rel="noreferrer" className="btn-secondary mt-6">Visit Earth Engine documentation <ExternalLink className="h-4 w-4" /></a><br /><Link to="/" className="mt-4 inline-block text-sm font-semibold text-brand-700">Return to hub</Link></div>;
}
