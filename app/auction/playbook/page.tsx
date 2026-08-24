import Link from "next/link";
import { SEGMENT_PLAYBOOKS } from "@/lib/auctionPlaybooks";

export const metadata = {
  title: "Auction Playbook",
  description: "Пошаговые сценарии атаки ATS, LMS, CX и CDP",
};

export default function AuctionPlaybookPage() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Software Auction</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Пошаговый playbook по сегментам</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Открывай нужный сегмент перед звонками: кому писать, что выяснить, что показать на demo и после каких фактов вообще отдавать сегмент в разработку.</p>
          </div>
          <Link href="/auction" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">← CRM</Link>
        </div>

        <div className="space-y-5">
          {SEGMENT_PLAYBOOKS.map((p, index) => (
            <section key={p.code} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Приоритет #{index + 1}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{p.code}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900">{p.title}</h2>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Info title="Идеальный клиент" text={p.target} />
                <Info title="ЛПР" text={p.lpr} />
                <Info title="Первый ключевой вопрос" text={p.firstQuestion} />
                <Info title="Что показывать на demo" text={p.demo} />
                <Info title="Формула оффера" text={p.offer} />
                <Info title="Гейт в разработку" text={p.buildGate} />
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Последовательность действий</h3>
                <ol className="mt-3 space-y-2">
                  {p.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{text}</div>
    </div>
  );
}
