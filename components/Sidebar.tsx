"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/workday", label: "Мой день", icon: "☀" },
  { href: "/leads", label: "Лиды", icon: "◎" },
  { href: "/quick-wins", label: "Quick Wins", icon: "⚡" },
  { href: "/signals", label: "Сигналы", icon: "📡" },
  { href: "/sources", label: "Источники", icon: "🔌" },
  { href: "/tasks", label: "Задачи", icon: "✓" },
  { href: "/messages", label: "Сообщения", icon: "✉" },
  { href: "/scripts", label: "Скрипты продаж", icon: "📜" },
  { href: "/replies", label: "Классификатор ответов", icon: "💬" },
  { href: "/offers", label: "Офферы", icon: "🎯" },
  { href: "/import", label: "Импорт", icon: "⇪" },
  { href: "/analytics", label: "Аналитика", icon: "📊" },
  { href: "/founder", label: "Founder Control", icon: "👑" },
  { href: "/settings", label: "Настройки / API", icon: "⚙" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center font-bold">P</div>
          <div className="leading-tight">
            <div className="font-bold text-graphite text-[15px]">Client Radar</div>
            <div className="text-[11px] text-slate-400">radar.pabliki.kz</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active ? "bg-brand-soft text-brand font-semibold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="w-5 text-center text-[13px]">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 grid place-items-center text-slate-600 font-semibold">A</div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-graphite">Айгерим</div>
            <div className="text-[11px] text-slate-400">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
