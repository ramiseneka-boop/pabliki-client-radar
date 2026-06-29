import Topbar from "@/components/Topbar";
import { leads } from "@/lib/mock";

const types = [
  "Первое WhatsApp", "Follow-up 1 день", "Follow-up 3 дня", "После интереса",
  "Ответ на «дорого»", "Ответ на «пришлите КП»", "Ответ на «мы подумаем»", "Нишевое", "Краткое КП",
];

export default function MessagesPage() {
  return (
    <>
      <Topbar title="Сообщения" subtitle="Библиотека сгенерированных сообщений и КП · 9 типов" />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h2 className="font-bold text-graphite mb-3">Типы сообщений</h2>
          <ul className="space-y-1.5">
            {types.map((t, i) => (
              <li key={t} className={`px-3 py-2 rounded-lg text-sm ${i === 0 ? "bg-brand-soft text-brand font-medium" : "text-slate-600 hover:bg-slate-50"}`}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {leads.slice(0, 3).map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-graphite">{l.company}</div>
                <span className="text-xs text-slate-400">Первое WhatsApp · {l.category}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{l.whatsappMessage}</p>
              <div className="mt-2 flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white">Отправить</button>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">Редактировать</button>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">⧉ Копировать</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
