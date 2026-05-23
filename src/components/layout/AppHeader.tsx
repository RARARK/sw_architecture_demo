import { CalendarDays, ChevronDown, ClipboardList, LayoutDashboard, MessageSquare, Shield, Users, Sun, Moon } from "lucide-react";
import type { View } from "../../types/ui";
import type { User } from "../../types";

const navItems: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: "home", label: "홈", icon: LayoutDashboard },
  { id: "chat", label: "채팅", icon: MessageSquare },
  { id: "tasks", label: "작업", icon: ClipboardList },
  { id: "calendar", label: "캘린더", icon: CalendarDays },
  { id: "org", label: "조직도", icon: Users },
  { id: "settings", label: "보안", icon: Shield }
];

export function AppHeader({
  view,
  onViewChange,
  theme,
  onThemeToggle,
  currentUser,
  onProfileClick
}: {
  view: View;
  onViewChange: (view: View) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  currentUser: User;
  onProfileClick: () => void;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-icon">
          <MessageSquare size={20} aria-hidden />
        </span>
        <span>Messenger Works</span>
      </div>
      <nav className="main-nav" aria-label="주요 화면">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => onViewChange(item.id)} title={item.label}>
              <Icon size={17} aria-hidden />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="theme-toggle-btn"
          onClick={onThemeToggle}
          title={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
          aria-label="테마 전환"
          style={{ marginRight: 12 }}
        >
          {theme === "light" ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
        </button>
        <div className="profile-chip" onClick={onProfileClick} style={{ cursor: "pointer" }}>
          <span className="avatar">{currentUser.avatar}</span>
          <span>{currentUser.name}</span>
          <span className={`status-dot ${currentUser.status}`} style={{ width: 8, height: 8, marginLeft: -2 }} />
          <ChevronDown size={16} aria-hidden />
        </div>
      </div>
    </header>
  );
}
