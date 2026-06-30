import { LeadTemperature } from "@/lib/types";
import { temperatureMeta } from "@/lib/temperature";

export default function TemperatureBadge({ temperature, size = "md" }: { temperature: LeadTemperature; size?: "sm" | "md" }) {
  const meta = temperatureMeta[temperature];
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-sm px-2.5 py-1" } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-semibold ${meta.badge} ${sizes[size]} ${
        temperature === "expired" ? "line-through opacity-70" : ""
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
