"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import ScoreBadge from "@/components/ScoreBadge";
import {
  leads, tenge, triggerLabels, actionLabels, statusLabels,
  priorityOf, priorityMeta, Priority,
} from "@/lib/mock";

const priorityFilters: { key: Priority | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "hot", label: "90–100 горячие" },
  { key: "warm", label: "75–89 тёплые" },
  { key: "watch", label: "50–74 наблюдать" },
  { key: "base", label: "ниже 50 база" },
];

export default function LeadsPage() {
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  const cities = useMemo(() => ["all", ...Array.from(new Set(leads.map((l) => l.city)))], []);
  const cats = useMemo(() => ["all", ...Array.from(new Set(leads.map((l) => l.category)))], []);

  const filtered = leads
    .filter((l) => (priority === "all" ? true : priorityOf(l.score) === priority))
    .filter((l) => (city === "all" ? true : l.city === city))
    .filter((l) => (category === "all" ? true : l.category === category))
    .filter((l) => (q ? l.company.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <Topbar title="Лиды" subtitle={`${filtered.length} лидов · отсортировано по Priority Score`} />
      <div className="p-8 space-y-5">
        {/* Фильтры */}
        <div className="card p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {priorityFilters.map((f) => (
              <button key={f.key} onClick={() => setPriority(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  priority === f.key ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по компании…"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm w-60 outline-none focus:border-brand" />
            <select value={city} onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              {cities.map((c) => <option key={c} value={c}>{c === "all" ? "Все города" : c}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              {cats.map((c) => <option key={c} value={c}>{c === "all" ? "Все ниши" : c}</option>)}
            </select>
          </div>
        </div>

        {/* Таблица */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Компания</th>
                <th className="px-4 py-3 font-medium">Ниша</th>
                <th className="px-4 py-3 font-medium">Гео</th>
                <th className="px-4 py-3 font-medium">Триггер</th>
                <th className="px-4 py-3 font-medium">Контакт</th>
                <th className="px-4 py-3 font-medium">Потенциал</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Действие</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const meta = priorityMeta[priorityOf(l.score)];
                return (
                  <tr key={l.id} className={`border-b border-slate-50 border-l-4 ${meta.row} hover:bg-slate-50/60`}>
                    <td className="px-4 py-3"><ScoreBadge score={l.score} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/leads/${l.id}`} className="font-semibold text-graphite hover:text-brand">{l.company}</Link>
                      <div className="text-xs text-slate-400">{l.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.category}</td>
                    <td className="px-4 py-3 text-slate-600">{l.city}<div className="text-xs text-slate-400">{l.district}</div></td>
                    <td className="px-4 py-3 text-slate-600">{triggerLabels[l.trigger] ?? l.trigger}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 text-xs">
                        {l.contacts.whatsapp && <span title="WhatsApp" className="text-emerald-600">WA</span>}
                        {l.contacts.phone && <span title="Телефон" className="text-slate-500">☎</span>}
                        {l.contacts.instagram && <span title="Instagram" className="text-pink-500">IG</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {l.contactConfidence === "high" ? "уверенность ↑" : l.contactConfidence === "medium" ? "уверенность ~" : "уверенность ↓"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{tenge(l.budgetMax)}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{statusLabels[l.status] ?? l.status}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-brand font-medium">{actionLabels[l.action] ?? l.action}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
