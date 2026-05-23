import type { Task, TaskStatus, User } from "../../types";
import type { RightPanel } from "../../types/ui";
import { users } from "../../data/mockData";
import { TaskList } from "../views/TaskList";

export function RightSidebar({
  rightPanel,
  tasks,
  setRightPanel,
  onStatus,
  onPersonClick
}: {
  rightPanel: RightPanel;
  tasks: Task[];
  setRightPanel: (panel: RightPanel) => void;
  onStatus: (taskId: string, status: TaskStatus) => void;
  onPersonClick?: (user: User) => void;
}) {
  return (
    <aside className="right-sidebar">
      <div className="panel-tabs" role="tablist" aria-label="우측 패널">
        <button className={rightPanel === "org" ? "active" : ""} onClick={() => setRightPanel("org")}>
          멤버
        </button>
        <button className={rightPanel === "tasks" ? "active" : ""} onClick={() => setRightPanel("tasks")}>
          작업
        </button>
      </div>
      {rightPanel === "org" ? (
        <SidebarMemberList onPersonClick={onPersonClick} />
      ) : (
        <TaskList 
          tasks={tasks.filter((t) => t.assigneeIds ? t.assigneeIds.includes("USER-001") : t.assigneeId === "USER-001")} 
          onStatus={onStatus} 
        />
      )}
    </aside>
  );
}

function SidebarMemberList({ onPersonClick }: { onPersonClick?: (user: User) => void }) {
  const visibleUsers = users.filter((user) => user.role !== "GUEST");

  return (
    <section className="sidebar-member-list" aria-label="조직 멤버 목록">
      {visibleUsers.map((user) => (
        <button key={user.id} className="sidebar-member-row" type="button" onClick={() => onPersonClick?.(user)}>
          <span className="avatar">{user.avatar}</span>
          <span className="sidebar-member-main">
            <strong>{user.name}</strong>
            <small>{user.department} · {user.position}</small>
          </span>
          <span className={`status-dot ${user.status}`} aria-label={user.status} />
        </button>
      ))}
    </section>
  );
}
