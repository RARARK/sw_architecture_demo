import type { LucideIcon } from "lucide-react";

export function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: string }) {
  return (
    <article className={`metric ${tone}`}>
      <Icon size={20} aria-hidden />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
