import { Filter, Search } from "lucide-react";

export default function CourseFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  technology,
  onTechnologyChange,
  careerTrack,
  onCareerTrackChange,
  accessType,
  onAccessTypeChange,
  categories,
  technologies,
  careerTracks,
  onReset,
}) {
  return (
    <div className="card mt-8 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
        <Filter className="h-4 w-4 text-brand-700" aria-hidden="true" /> Find the right course
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(190px,1fr)_minmax(150px,.75fr)_minmax(180px,1fr)_minmax(150px,.75fr)_auto] xl:items-end">
        <label className="block">
          <span className="label">Search courses</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search GeoAI, PostGIS, NDVI..." className="input pl-9" aria-label="Search courses" />
          </span>
        </label>
        <label className="block"><span className="label">Category</span><select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="input" aria-label="Filter courses by category"><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block"><span className="label">Level</span><select value={level} onChange={(event) => onLevelChange(event.target.value)} className="input" aria-label="Filter courses by level"><option value="all">All levels</option>{["Beginner", "Intermediate", "Advanced", "Professional", "Expert"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Technology</span><select value={technology} onChange={(event) => onTechnologyChange(event.target.value)} className="input" aria-label="Filter courses by technology"><option value="all">All technologies</option>{technologies.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Career track</span><select value={careerTrack} onChange={(event) => onCareerTrackChange(event.target.value)} className="input" aria-label="Filter courses by career track"><option value="all">All tracks</option>{careerTracks.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block"><span className="label">Access</span><select value={accessType} onChange={(event) => onAccessTypeChange(event.target.value)} className="input" aria-label="Filter courses by access"><option value="all">Free &amp; paid</option><option value="Free">Free</option><option value="Paid">Paid</option></select></label>
      </div>
      <button type="button" onClick={onReset} className="btn-secondary mt-4 justify-center">Reset filters</button>
    </div>
  );
}
