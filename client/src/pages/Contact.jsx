import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

export default function Contact() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", subject: "", message: "" });
  function submit(event) {
    event.preventDefault();
    const saved = JSON.parse(localStorage.getItem("geodata-hub-contact") || "[]");
    saved.push({ ...form, createdAt: new Date().toISOString(), status: "PENDING_REVIEW" });
    localStorage.setItem("geodata-hub-contact", JSON.stringify(saved));
    setDone(true);
  }
  if (done) return <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6"><CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" /><h1 className="mt-5 text-3xl font-black text-gray-900">Message saved</h1><p className="mt-2 text-gray-600">This frontend-only build stores the draft on this device. Use the official community channel for a live response.</p><button className="btn-secondary mt-6" onClick={() => setDone(false)}>Send another message</button></div>;
  return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><section><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Get in touch</p><h1 className="mt-2 text-3xl font-black text-gray-900">Contact Us</h1><p className="mt-4 text-base leading-relaxed text-gray-700">Have a question, collaboration idea, training inquiry, research proposal, or technical issue? Send a draft message or join the community channel.</p><div className="mt-8 flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-brand-600" /><p className="text-sm text-gray-600">No backend or account is required to browse this platform.</p></div></section><form onSubmit={submit} className="card space-y-5 p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="label">Full Name<input className="input mt-1" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label className="label">Email<input className="input mt-1" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label></div><label className="label">Subject<input className="input mt-1" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label><label className="label">Message<textarea className="input mt-1 min-h-40 resize-y" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label><button className="btn-primary"><Send className="h-4 w-4" /> Save message draft</button></form></div></div>;
}
