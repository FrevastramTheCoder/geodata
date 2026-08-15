import { Link, Navigate, useLocation } from "react-router-dom";
import { KeyRound } from "lucide-react";

import { useAuth } from "../auth.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!loading && user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo className="h-24 w-24" priority />
          <h1 className="mt-3 text-xl font-bold text-white">Administrator access</h1>
          <p className="mt-1 text-sm text-gray-400">GIS & Remote Sensing Hub</p>
        </div>
        <div className="card p-6 text-center">
          <KeyRound className="mx-auto h-8 w-8 text-brand-600" />
          <h2 className="mt-3 text-lg font-bold text-gray-900">Use Google OAuth</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Administrators sign in with their approved Google account. Passwords are not stored by this website.
          </p>
          <Link to="/login" state={{ from: location.state?.from || "/admin" }} className="btn-primary mt-5 w-full justify-center">
            Continue to Google sign-in
          </Link>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">Return to public site</Link>
        </div>
      </div>
    </div>
  );
}
