import Topbar from "@/components/Topbar";

const steps = [
  { n: 1, title: "Загрузка файла", desc: "Excel (.xlsx) или CSV со списком компаний" },
  { n: 2, title: "Маппинг колонок", desc: "Сопоставить колонки файла с полями лида" },
  { n: 3, title: "Предпросмотр", desc: "Проверить распознанные гео и ниши" },
  { n: 4, title: "Дедупликация", desc: "Система найдёт и пометит дубли" },
  { n: 5, title: "Импорт", desc: "Создание лидов + авто-скоринг" },
];

export default function ImportPage() {
  return (
    <>
      <Topbar title="Импорт" subtitle="Загрузка списков лидов из Excel / CSV" />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-8">
          <div className="border-2 border-dashed border-slate-200 rounded-xl2 p-12 text-center">
            <div className="text-4xl mb-3">⇪</div>
            <div className="font-semibold text-graphite">Перетащите файл сюда</div>
            <div className="text-sm text-slate-400 mt-1">или нажмите, чтобы выбрать .xlsx / .csv</div>
            <button className="mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm">Выбрать файл</button>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-graphite mb-3">История импортов</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 font-medium">Файл</th><th className="py-2 font-medium">Всего</th>
                <th className="py-2 font-medium">Создано</th><th className="py-2 font-medium">Дубли</th><th className="py-2 font-medium">Статус</th>
              </tr></thead>
              <tbody>
                <tr className="border-b border-slate-50"><td className="py-2">leads_almaty_june.xlsx</td><td>320</td><td>274</td><td>46</td><td><span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">готово</span></td></tr>
                <tr className="border-b border-slate-50"><td className="py-2">2gis_clinics.csv</td><td>140</td><td>118</td><td>22</td><td><span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">готово</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-graphite mb-4">Как работает импорт</h3>
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-brand-soft text-brand grid place-items-center text-sm font-semibold">{s.n}</span>
                <div>
                  <div className="text-sm font-medium text-graphite">{s.title}</div>
                  <div className="text-xs text-slate-400">{s.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
