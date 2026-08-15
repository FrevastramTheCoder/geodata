import { Instagram, Linkedin } from "lucide-react";

export const LINKEDIN_URL = "https://www.linkedin.com/in/geobrains-academy-1b0809429";
export const INSTAGRAM_URL = "https://www.instagram.com/geobrains_academy/?hl=en";

export default function AcademySocialLinks({ dark = false, follow = false, className = "" }) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2";
  const linkedinClass = dark
    ? `${base} bg-brand-500 text-white shadow-sm hover:bg-brand-400 focus-visible:ring-offset-brand-950`
    : "btn-secondary";
  const instagramClass = dark
    ? `${base} border border-white/20 text-white hover:bg-white/10 focus-visible:ring-offset-brand-950`
    : `${base} border border-brand-200 bg-brand-50 text-brand-800 shadow-sm hover:border-brand-400 hover:bg-brand-100`;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`} aria-label="GeoBrains Academy social links">
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkedinClass}
        aria-label={`${follow ? "Follow GeoBrains Academy on" : "GeoBrains Academy on"} LinkedIn`}
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        {follow ? "Follow on LinkedIn" : "LinkedIn"}
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={instagramClass}
        aria-label={`${follow ? "Follow GeoBrains Academy on" : "GeoBrains Academy on"} Instagram`}
      >
        <Instagram className="h-4 w-4" aria-hidden="true" />
        {follow ? "Follow on Instagram" : "Instagram"}
      </a>
    </div>
  );
}
