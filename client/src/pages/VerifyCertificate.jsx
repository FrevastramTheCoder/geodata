import { Link, useParams } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  return <div className="mx-auto max-w-xl px-4 py-16 sm:px-6"><div className="card p-8 text-center"><Search className="mx-auto h-12 w-12 text-brand-600" /><h1 className="mt-4 text-2xl font-black text-gray-900">Certificate verification</h1><p className="mt-2 text-sm text-gray-600">{certificateId ? `Certificate ${certificateId} must be verified by its issuing organization.` : "Enter a certificate ID on the issuer's official verification page."}</p><a href="https://developers.google.com/earth-engine" target="_blank" rel="noreferrer" className="btn-secondary mt-6">Open official provider <ExternalLink className="h-4 w-4" /></a><Link to="/" className="btn-secondary mt-3">Return to hub</Link></div></div>;
}
