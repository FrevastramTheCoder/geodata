import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Wrench } from "lucide-react";
import BrandLogo from "../components/BrandLogo.jsx";
import { getTraining } from "../data/courses.js";

export default function CourseDetail() {
  const { slug } = useParams();
  const course = getTraining(slug);

  if (!course) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-red-700">Course not found.</p>
        <Link to="/training" className="btn-secondary mt-5">Back to training</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/training" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Training catalog
      </Link>

      <section className="rounded-2xl bg-brand-950 p-7 text-white sm:p-10">
        <BrandLogo className="mb-4 h-20 w-20" />
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-white/10 text-brand-200">{course.category}</span>
          <span className="badge bg-brand-500/20 text-brand-200">{course.level}</span>
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-300">{course.description}</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-300">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Instructor</dt>
            <dd className="mt-1 font-semibold text-white">{course.instructor}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Duration</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-white">
              <Clock3 className="h-4 w-4" aria-hidden="true" /> {course.duration}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Format</dt>
            <dd className="mt-1 font-semibold text-white">Project-based learning</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <main className="space-y-6">
          <section id="course-project" className="card p-6">
            <h2 className="text-lg font-bold text-gray-900">Practical project</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{course.practicalProject}</p>
            <h2 className="mt-7 text-lg font-bold text-gray-900">Skills gained</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {course.skills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <BookOpen className="h-5 w-5 text-brand-700" aria-hidden="true" /> Course curriculum
            </h2>
            <div className="mt-4 space-y-3">
              {course.lessons.map((lesson, index) => (
                <article key={lesson} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900">{lesson}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        Guided concepts, practical exercises and a project milestone for this course.
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Wrench className="h-5 w-5 text-brand-700" aria-hidden="true" /> Software &amp; tools
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.tools.map((tool) => (
              <span key={tool} className="badge bg-brand-50 text-brand-800">{tool}</span>
            ))}
          </div>
          <dl className="mt-6 space-y-4 border-t border-gray-100 pt-5 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</dt>
              <dd className="mt-1 font-semibold text-gray-900">{course.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Level</dt>
              <dd className="mt-1 font-semibold text-gray-900">{course.level}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</dt>
              <dd className="mt-1 font-semibold text-gray-900">{course.duration}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Certificate</dt>
              <dd className="mt-1 font-semibold text-gray-900">{course.certificate}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Career track</dt>
              <dd className="mt-1 font-semibold text-gray-900">{course.careerTracks[0] || "Flexible pathway"}</dd>
            </div>
          </dl>
          <Link to="/training#course-catalog" className="btn-primary mt-6 w-full justify-center">
            Browse more courses <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
