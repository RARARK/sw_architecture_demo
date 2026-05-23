import type { LucideIcon } from "lucide-react";

export function QuickCard({
  icon: Icon,
  title,
  text,
  onClick
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-card" onClick={onClick}>
      <Icon size={22} aria-hidden />
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}
