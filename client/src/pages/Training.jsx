import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Globe2,
  ImageIcon,
  Layers3,
  Mountain,
  Plane,
  Route,
  Satellite,
  Server,
  Search,
  Sparkles,
  Sprout,
  Star,
  Trees,
  TriangleAlert,
  TrendingUp,
  Waves,
  Wrench,
} from "lucide-react";
import AcademyCTA from "../components/academy/AcademyCTA.jsx";
import AcademyHero from "../components/academy/AcademyHero.jsx";
import AcademyIcon from "../components/academy/AcademyIcon.jsx";
import CourseCard, { CourseHighlight } from "../components/academy/CourseCard.jsx";
import CourseFilters from "../components/academy/CourseFilters.jsx";
import LearningPathCard from "../components/academy/LearningPathCard.jsx";
import ProjectCard from "../components/academy/ProjectCard.jsx";
import TechnologyCard from "../components/academy/TechnologyCard.jsx";
import {
  ACADEMY_PILLARS,
  FLAGSHIP_PROGRAM,
  FUTURE_TECHNOLOGIES,
  GENERATIVE_AI_DEMO_STEPS,
  LEARN_BUILD_PROCESS,
} from "../data/academyContent.js";
import { COURSE_CATEGORIES, TRAINING_RESOURCES } from "../data/courses.js";
import { LEARNING_PATHS } from "../data/learningPaths.js";
import { ACADEMY_PROJECTS } from "../data/projects.js";

const CORE_TOPICS = [
  { title: "Python for GIS", body: "Scripting and automation for GIS workflows.", icon: Code2 },
  { title: "Spatial Data Analysis", body: "Vector and raster data manipulation, analysis, and visualization.", icon: BarChart3 },
  { title: "Web GIS & Interactive Maps", body: "Development of web mapping applications and interactive geospatial platforms.", icon: Globe2 },
  { title: "Remote Sensing & Earth Observation", body: "Satellite imagery processing and Earth observation analysis.", icon: Satellite },
  { title: "GeoAI & Machine Learning", body: "Artificial intelligence and machine learning applications in geospatial data.", icon: Bot },
  { title: "Spatial Databases", body: "Managing, querying, and analyzing large geospatial datasets.", icon: Database },
  { title: "Google Earth Engine", body: "Cloud-based planetary-scale geospatial analysis.", icon: Cloud },
  { title: "Drone Mapping", body: "UAV mapping, photogrammetry, orthomosaic generation, and spatial data production.", icon: Plane },
  { title: "GPS & GNSS Technologies", body: "Positioning, navigation, field data collection, and GNSS technologies.", icon: Route },
];

const TOOL_GROUPS = [
  { title: "Desktop GIS", icon: Layers3, tools: ["ArcGIS Pro", "QGIS", "GRASS GIS", "SAGA GIS", "AutoCAD Map 3D"] },
  { title: "Web Mapping & Servers", icon: Server, tools: ["GeoServer", "Leaflet", "MapLibre"] },
  { title: "Cloud & Big Data", icon: Cloud, tools: ["Google Earth Engine", "Global Mapper", "STAC", "GeoParquet"] },
  { title: "Databases", icon: Database, tools: ["SQL", "PostgreSQL", "PostGIS", "DuckDB Spatial"] },
];

const APPLICATION_DOMAINS = [
  { title: "Environment", body: "Ecosystem monitoring and environmental assessment.", icon: Trees },
  { title: "Urban Planning", body: "Smart city development, spatial planning, and urban analysis.", icon: Building2 },
  { title: "Agriculture", body: "Precision farming, crop monitoring, and agricultural suitability analysis.", icon: Sprout },
  { title: "Disaster Management", body: "Risk assessment, vulnerability mapping, and emergency response.", icon: TriangleAlert },
  { title: "Infrastructure", body: "Transportation, utilities, construction, and infrastructure planning.", icon: Route },
  { title: "Natural Resources", body: "Mining, forestry, water management, and natural resource monitoring.", icon: Mountain },
];

const DATA_TYPES = [
  { title: "Satellite Imagery", body: "Earth observation imagery and multispectral satellite data.", icon: ImageIcon },
  { title: "Land Cover", body: "Land-cover classification and change detection.", icon: Layers3 },
  { title: "Elevation", body: "DEMs, terrain modelling, slope, aspect, and elevation analysis.", icon: Mountain },
  { title: "Water Bodies", body: "Hydrology, water-body mapping, and surface-water analysis.", icon: Waves },
];

const FEATURED_COURSES = TRAINING_RESOURCES.filter((course) => course.featured).slice(0, 6);
const POPULAR_COURSES = TRAINING_RESOURCES.filter((course) => course.popular).slice(0, 6);
const NEW_COURSES = TRAINING_RESOURCES.filter((course) => course.isNew).slice(0, 6);
const TECHNOLOGIES = [...new Set(TRAINING_RESOURCES.flatMap((course) => course.technologyTags))].sort();
const CAREER_TRACKS = [...new Set(TRAINING_RESOURCES.flatMap((course) => course.careerTracks))].sort();

function TopicCard({ title, body, icon: Icon }) {
  return (
    <article className="card flex gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div><h3 className="text-base font-bold text-gray-900">{title}</h3><p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p></div>
    </article>
  );
}

function ToolGroup({ title, icon: Icon, tools }) {
  return (
    <article className="card p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="text-base font-bold text-gray-900">{title}</h3></div>
      <ul className="mt-5 space-y-2.5">{tools.map((tool) => <li key={tool} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />{tool}</li>)}</ul>
    </article>
  );
}

function ApplicationCard({ title, body, icon: Icon }) {
  return <article className="card p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-100"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-4 text-base font-bold text-gray-900">{title}</h3><p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p></article>;
}

function SpotlightGroup({ title, icon: Icon, courses }) {
  return <div><h2 className="flex items-center gap-2 text-lg font-black text-gray-900"><Icon className="h-5 w-5 text-brand-700" aria-hidden="true" />{title}</h2><div className="mt-4 space-y-3">{courses.map((course) => <CourseHighlight key={course.slug} course={course} />)}</div></div>;
}

function SectionIntro({ eyebrow, title, body }) {
  return <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p><h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">{title}</h2>{body && <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>}</div>;
}

export default function Training() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTechnology, setSelectedTechnology] = useState("all");
  const [selectedCareerTrack, setSelectedCareerTrack] = useState(searchParams.get("track") || "all");
  const [selectedAccessType, setSelectedAccessType] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(24);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCourses = TRAINING_RESOURCES.filter((course) => {
    const matchesCategory = selectedCategory === "all" || course.categoryId === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    const matchesTechnology = selectedTechnology === "all" || course.technologyTags.includes(selectedTechnology);
    const matchesCareerTrack = selectedCareerTrack === "all" || course.careerTracks.includes(selectedCareerTrack);
    const matchesAccess = selectedAccessType === "all" || course.accessType === selectedAccessType;
    const searchText = [course.title, course.category, course.description, course.practicalProject, ...course.tools, ...course.skills, ...course.careerTracks].join(" ").toLowerCase();
    const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
    return matchesCategory && matchesLevel && matchesTechnology && matchesCareerTrack && matchesAccess && matchesQuery;
  });
  const displayedCourses = filteredCourses.slice(0, visibleLimit);

  function updateFilter(setter) {
    return (value) => { setter(value); setVisibleLimit(24); };
  }

  function resetFilters() {
    setQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedTechnology("all");
    setSelectedCareerTrack("all");
    setSelectedAccessType("all");
    setVisibleLimit(24);
  }

  return (
    <div>
      <AcademyHero courseCount={TRAINING_RESOURCES.length} categoryCount={COURSE_CATEGORIES.length} pathCount={LEARNING_PATHS.length} />

      <main>
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <SectionIntro eyebrow="The academy advantage" title="A modern geospatial technology ecosystem" body="GeoBrains Academy is a modern geospatial technology learning platform focused on practical skills, real-world projects, GeoAI, Earth observation, spatial data science, Web GIS, digital twins, drone technology and geospatial product development." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {ACADEMY_PILLARS.map((pillar) => <TechnologyCard key={pillar.title} item={pillar} />)}
            </div>
          </div>
        </section>

        <section className="bg-gray-50">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:py-16">
            <div>
              <span className="badge bg-brand-50 text-brand-700"><AcademyIcon name="brain" className="h-3.5 w-3.5" /> Future-ready workflow</span>
              <h2 className="mt-4 text-2xl font-black text-gray-900 sm:text-3xl">🧠 Generative AI for GIS</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Learn to make GIS work more expressive and productive without hiding the spatial reasoning. The academy teaches people to validate AI outputs, use trusted data and keep the analyst in control.</p>
              <blockquote className="mt-5 rounded-xl border-l-2 border-brand-500 bg-white p-4 text-sm font-semibold leading-relaxed text-gray-800 shadow-sm">“Find suitable areas for a hospital within 5 km of major roads and outside flood-prone areas.”</blockquote>
            </div>
            <div className="card p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-bold text-gray-900">Natural language → spatial result</h3><span className="badge bg-brand-50 text-brand-700">Demo concept</span></div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {GENERATIVE_AI_DEMO_STEPS.map((step, index) => <li key={step} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{index + 1}</span><span className="text-sm font-semibold text-gray-800">{step}</span></li>)}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-brand-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
              <div><span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><AcademyIcon name="rocket" className="h-3.5 w-3.5" /> Flagship program</span><h2 className="mt-4 text-2xl font-black sm:text-3xl">{FLAGSHIP_PROGRAM.title}</h2><p className="mt-3 text-lg font-bold text-brand-300">{FLAGSHIP_PROGRAM.subtitle}</p><p className="mt-3 text-sm leading-relaxed text-gray-300">{FLAGSHIP_PROGRAM.description}</p><p className="mt-4 text-sm font-semibold text-gray-200">Final requirement: complete <span className="text-brand-300">3–5 real-world projects</span>.</p></div>
              <div><h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">Program modules</h3><div className="mt-4 flex flex-wrap gap-2">{FLAGSHIP_PROGRAM.modules.map((module) => <span key={module} className="badge bg-white/10 text-gray-200 ring-1 ring-white/10">{module}</span>)}</div><h3 className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-brand-300">Project examples</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{FLAGSHIP_PROGRAM.projects.map((project) => <div key={project} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200"><CheckCircle2 className="h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />{project}</div>)}</div></div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <SectionIntro eyebrow="Curated pathways" title="Start with a focused pathway" body="Do not only collect course titles. Follow a sequence that turns a capability into a portfolio, product or career outcome." />
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <SpotlightGroup title="Featured Courses" icon={Star} courses={FEATURED_COURSES} />
              <SpotlightGroup title="Popular Training" icon={TrendingUp} courses={POPULAR_COURSES} />
              <SpotlightGroup title="New Training" icon={Sparkles} courses={NEW_COURSES} />
            </div>
          </div>
        </section>

        <section id="course-catalog" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <SectionIntro eyebrow="Learn by building" title="Courses & Training Catalog" body="Search the original GeoBrains Academy curriculum by category, technology, career track, level and access type. Expand any card to inspect the project, tools, skills and certificate pathway." />
            <CourseFilters query={query} onQueryChange={updateFilter(setQuery)} category={selectedCategory} onCategoryChange={updateFilter(setSelectedCategory)} level={selectedLevel} onLevelChange={updateFilter(setSelectedLevel)} technology={selectedTechnology} onTechnologyChange={updateFilter(setSelectedTechnology)} careerTrack={selectedCareerTrack} onCareerTrackChange={updateFilter(setSelectedCareerTrack)} accessType={selectedAccessType} onAccessTypeChange={updateFilter(setSelectedAccessType)} categories={COURSE_CATEGORIES} technologies={TECHNOLOGIES} careerTracks={CAREER_TRACKS} onReset={resetFilters} />
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between"><p aria-live="polite">Showing <strong className="text-gray-900">{displayedCourses.length}</strong> of {filteredCourses.length} matching courses ({TRAINING_RESOURCES.length} total)</p><p className="text-xs text-gray-500">Course cards expand for project, tools and skills.</p></div>
            {displayedCourses.length > 0 ? <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{displayedCourses.map((course) => <CourseCard key={course.slug} course={course} />)}</div> : <div className="card mt-5 p-10 text-center"><SearchIcon /><h3 className="mt-3 text-lg font-bold text-gray-900">No matching courses</h3><p className="mt-1 text-sm text-gray-600">Try a broader search or reset the filters.</p><button type="button" onClick={resetFilters} className="btn-secondary mt-5">Show all courses</button></div>}
            {displayedCourses.length < filteredCourses.length && <div className="mt-8 text-center"><button type="button" onClick={() => setVisibleLimit((limit) => limit + 24)} className="btn-secondary">Load more courses <ArrowRight className="h-4 w-4 rotate-90" aria-hidden="true" /></button></div>}
          </div>
        </section>

        <section id="learning-paths" className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Career-based learning" title="Learning Paths" body="Choose a complete track and see how individual courses connect to a professional direction." /><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{LEARNING_PATHS.map((path) => <LearningPathCard key={path.id} path={path} />)}</div></div>
        </section>

        <section id="projects" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Portfolio first" title="🛠️ Build Real Projects" body="Every advanced pathway should leave you with something useful to explain, demo, deploy or improve." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{ACADEMY_PROJECTS.map((project) => <ProjectCard key={project.id} project={project} />)}</div></div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Academy philosophy" title="Learn → Build → Deploy → Earn" body="Do not only teach students how to use GIS. Teach them how to turn GIS skills into income, products and meaningful work." /><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{LEARN_BUILD_PROCESS.map((step, index) => <div key={step} className="relative rounded-xl border border-brand-100 bg-brand-50 p-4 text-center"><div className="text-xs font-black tracking-wide text-brand-800">{step}</div>{index < LEARN_BUILD_PROCESS.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-brand-500 lg:block" aria-hidden="true" />}</div>)}</div></div>
        </section>

        <section id="core-topics" className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Training framework" title="Core Discussion Topics" body="Build a connected foundation across the methods and technologies used in modern geospatial work." /><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{CORE_TOPICS.map((topic) => <TopicCard key={topic.title} {...topic} />)}</div></div>
        </section>

        <section id="software-tools" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Technology stack" title="Software & Tools" body="Develop confidence with the desktop, web, cloud, database and open-source tools used by geospatial teams." /><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{TOOL_GROUPS.map((group) => <ToolGroup key={group.title} {...group} />)}</div></div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Impact in practice" title="🌍 Real-World Application Domains" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{APPLICATION_DOMAINS.map((domain) => <ApplicationCard key={domain.title} {...domain} />)}</div></div>
        </section>

        <section className="bg-brand-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><SectionIntro eyebrow="Data foundations" title="🗺️ Geospatial Data Types" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{DATA_TYPES.map((dataType) => <ApplicationCard key={dataType.title} {...dataType} />)}</div></div>
        </section>

        <section className="border-t border-gray-200 bg-brand-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16"><div className="max-w-3xl"><span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Future-ready academy</span><h2 className="mt-4 text-2xl font-black sm:text-3xl">🔮 What&apos;s Next in Geospatial Technology?</h2><p className="mt-3 text-sm leading-relaxed text-gray-300">GeoBrains Academy is preparing learners for the next wave of location intelligence, rather than only teaching traditional GIS workflows.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{FUTURE_TECHNOLOGIES.map((item) => <TechnologyCard key={item.title} item={item} dark />)}</div></div>
        </section>

        <section className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14"><div className="card grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center sm:p-8"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Community &amp; collaboration</p><h2 className="mt-2 text-2xl font-black text-gray-900">🌍 GIS &amp; Remote Sensing Hub</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">Welcome to GIS &amp; Remote Sensing Hub, a community for learners, professionals, researchers, and innovators passionate about geospatial technologies. Topics include GIS, Remote Sensing, GeoAI, Spatial Data Science, Drone Mapping, GPS, Google Earth Engine, Python for GIS, Web GIS, Cartography, Spatial Databases, research, jobs, scholarships, internships and collaboration.</p><div className="mt-4 flex flex-wrap gap-2">{["Learn Together", "Share Knowledge", "Build Skills", "Innovate", "Support One Another"].map((value) => <span key={value} className="badge bg-brand-50 text-brand-700">{value}</span>)}</div></div><Link to="/community" className="btn-primary justify-center">Explore the Hub <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
        </section>

        <AcademyCTA />
      </main>
    </div>
  );
}

function SearchIcon() {
  return <Search className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />;
}
