import { useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";

import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try { setMessages(await api.get("/admin/messages")); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function mark(id, status) {
    try { await api.patch(`/admin/messages/${id}`, { status }); await load(); } catch (e) { setError(e.message); }
  }

  if (loading) return <Loading label="Loading messages..." />;
  return <div>
    <h1 className="text-2xl font-bold text-gray-900">Contact messages</h1>
    <p className="mt-1 text-sm text-gray-600">Private enquiries submitted through the contact form.</p>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-6 space-y-3">{messages.map((message) => <article key={message.id} className={`card p-5 ${message.status === "UNREAD" ? "border-brand-300" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3">{message.status === "UNREAD" ? <Mail className="mt-1 h-5 w-5 text-brand-600" /> : <MailOpen className="mt-1 h-5 w-5 text-gray-400" />}<div><h2 className="font-bold text-gray-900">{message.subject}</h2><p className="mt-0.5 text-sm text-gray-600">{message.fullName} · <a className="text-brand-700 hover:underline" href={`mailto:${message.email}`}>{message.email}</a></p></div></div><span className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</span></div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{message.message}</p>
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">{message.status === "UNREAD" && <button className="btn-secondary py-2 text-xs" onClick={() => mark(message.id, "READ")}>Mark read</button>}{message.status !== "ARCHIVED" && <button className="btn-secondary py-2 text-xs" onClick={() => mark(message.id, "ARCHIVED")}>Archive</button>}</div>
    </article>)}{!messages.length && <div className="card p-10 text-center text-sm text-gray-500">No contact messages.</div>}</div>
  </div>;
}
