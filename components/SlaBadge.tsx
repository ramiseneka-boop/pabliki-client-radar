import { SlaStatus } from "@/lib/types";
import { slaStatusMeta } from "@/lib/sla";

function countdownText(deadlineAt?: string): string | null {
  if (!deadlineAt) return null;
  const ms = new Date(deadlineAt).getTime() - Date.now();
  const hours = Math.round(ms / (1000 * 60 * 60));
  if (hours > 0) return `осталось ~${hours} ч`;
  if (hours === 0) return "дедлайн сейчас";
  return `просрочено на ~${Math.abs(hours)} ч`;
}

export default function SlaBadge({
  status, deadlineAt, showCountdown = false, size = "md",
}: { status: SlaStatus; deadlineAt?: string; showCountdown?: boolean; size?: "sm" | "md" }) {
  const meta = slaStatusMeta[status];
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-sm px-2.5 py-1" } as const;
  const countdown = showCountdown ? countdownText(deadlineAt) : null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-semibold ${meta.badge} ${sizes[size]}`}>
      {meta.label}
      {countdown && <span className="font-normal opacity-80">· {countdown}</span>}
    </span>
  );
}
