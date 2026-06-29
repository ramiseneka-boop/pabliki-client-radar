import { priorityOf, priorityMeta } from "@/lib/mock";

export default function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const p = priorityOf(score);
  const meta = priorityMeta[p];
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-lg px-3.5 py-1.5 font-bold",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-semibold ${meta.badge} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {score}
    </span>
  );
}
