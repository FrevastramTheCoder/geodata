import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <Compass className="h-14 w-14 text-brand-600" />
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}