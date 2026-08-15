import { useEffect, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

export default function AdminCourses() {
  const [courses, setCourses] = useState(null); const [error, setError] = useState("");
  async function load() { try { setCourses(await api.get("/admin/courses")); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function setStatus(course, status) { try { await api.patch(`/admin/courses/${course.id}/status`, { status }); await load(); } catch (e) { setError(e.message); } }
  if (!courses && !error) return <Loading label="Loading courses..." />;
  return <div><h1 className="text-2xl font-bold text-gray-900">Training courses</h1><p className="mt-1 text-sm text-gray-600">Manage course publication and monitor lessons, enrollments and certificates.</p>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 grid gap-4 md:grid-cols-2">{courses?.map((course) => <article key={course.id} className="card p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><GraduationCap className="h-5 w-5" /></div><div><h2 className="font-bold text-gray-900">{course.title}</h2><p className="mt-1 text-xs text-gray-500">{course.category} · {course.level}</p></div></div><span className="badge bg-gray-100 text-gray-700">{course.status}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-gray-50 p-2"><BookOpen className="mx-auto h-4 w-4 text-brand-600" /><div className="mt-1 font-bold text-gray-900">{course._count.lessons}</div><div className="text-gray-500">Lessons</div></div><div className="rounded-lg bg-gray-50 p-2"><div className="mt-5 font-bold text-gray-900">{course._count.enrollments}</div><div className="text-gray-500">Enrolled</div></div><div className="rounded-lg bg-gray-50 p-2"><div className="mt-5 font-bold text-gray-900">{course._count.certificates}</div><div className="text-gray-500">Certificates</div></div></div><div className="mt-4 flex gap-2">{course.status !== "PUBLISHED" && <button className="btn-primary py-2 text-xs" onClick={() => setStatus(course, "PUBLISHED")}>Publish</button>}{course.status === "PUBLISHED" && <button className="btn-secondary py-2 text-xs" onClick={() => setStatus(course, "ARCHIVED")}>Archive</button>}</div></article>)}{courses && !courses.length && <div className="card col-span-full p-10 text-center text-sm text-gray-500">No courses yet.</div>}</div></div>;
}
