export default function BrandLogo({ className = "h-16 w-16", priority = false }) {
  return (
    <img
      src="/images/geobrains-academy-logo.png"
      alt="GeoBrains Academy"
      width={16709}
      height={16709}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`block object-contain ${className}`}
    />
  );
}
