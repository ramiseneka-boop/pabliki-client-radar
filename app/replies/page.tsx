"use client";
import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { replyClassifications, leads } from "@/lib/mock";

const classificationPill: Record<string, string> = {
  interested: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  objection_price: "bg-amber-50 text-amber-600 ring-amber-200",
  objection_timing: "bg-amber-50 text-amber-600 ring-amber-200",
  not_interested: "bg-slate-100 text-slate-500 ring-slate-200",
  wrong_contact: "bg-red-50 text-red-600 ring-red-200",
  already_client: "bg-sky-50 text-sky-600 ring-sky-200",
  needs_followup: "bg-brand-soft text-brand ring-blue-200",
};
const classificationLabel: Record<string, string> = {
  interested: "заинтересован",
  objection_price: "возражение: цена",
  objection_timing: "возражение: время",
  not_interested: "не интересно",
  wrong_contact: "неверный контакт",
  already_client: "уже клиент",
  needs_followup: "нужен follow-up",
};

export default function RepliesPage() {
  const [demoText, setDemoText] = useState("");

  return (
    <>
      <Topbar title="Reply Classifier" subtitle="Классификация ответов клиентов и рекомендованное следующее действие" />
      <div className="p-8 space-y-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-graphite">Классифицировать новый ответ</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">демо, без backend</span>
          </div>
          <textarea
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            placeholder="Вставьте текст ответа клиента для демонстрации интерфейса…"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand resize-none h-20"
          />
          <button
            type="button"
            disabled
            className="mt-3 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold opacity-50 cursor-not-allowed"
            title="Демо-кнопка — классификация в прототипе не выполняется"
          >
            Классифицировать
          </button>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Лид</th>
                <th className="px-4 py-3 font-medium">Текст ответа</th>
                <th className="px-4 py-3 font-medium">Классификация</th>
                <th className="px-4 py-3 font-medium">Рекомендованное действие</th>
              </tr>
            </thead>
            <tbody>
              {replyClassifications.map((rc) => {
                const lead = leads.find((l) => l.id === rc.leadId);
                return (
                  <tr key={rc.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      {lead ? (
                        <Link href={`/leads/${lead.id}`} className="font-semibold text-graphite hover:text-brand">
                          {lead.company}
                        </Link>
                      ) : (
                        rc.leadId
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-sm">{rc.replyText}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ring-1 ${classificationPill[rc.classification]}`}>
                        {classificationLabel[rc.classification]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rc.suggestedNextAction}</td>
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
