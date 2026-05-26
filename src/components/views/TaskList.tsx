import { Calendar } from "lucide-react";
import { useRef, useState } from "react";
import type { Task, TaskStatus } from "../../types";
import { taskStatusLabel, userById } from "../../utils/demo";

const PRIORITY_CONFIG: Record<string, { label: string; icon: string; cls: string }> = {
  HIGH:   { label: "높음", icon: "↑", cls: "tl-priority-high" },
  MEDIUM: { label: "중간", icon: "–", cls: "tl-priority-medium" },
  LOW:    { label: "낮음", icon: "↓", cls: "tl-priority-low" },
};

const BORDER_COLOR: Record<string, string> = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#22c55e",
};

const STATUS_ORDER: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "HOLD"];

function formatDue(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 마감`;
}

function StatusMenu({
  taskId,
  current,
  onStatus,
}: {
  taskId: string;
  current: TaskStatus;
  onStatus: (id: string, s: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="tl-status-wrap" ref={ref}>
      <button
        className={`tl-status-badge tl-status-${current.toLowerCase()}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tl-status-icon" />
        {taskStatusLabel[current]}
      </button>
      {open && (
        <div className="tl-status-menu">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              className={`tl-status-menu-item ${s === current ? "active" : ""}`}
              onClick={() => { onStatus(taskId, s); setOpen(false); }}
            >
              {taskStatusLabel[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskList({
  tasks,
  onStatus,
}: {
  tasks: Task[];
  onStatus: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <section className="tl-root">
      <div className="tl-header">
        <span className="tl-header-title">내 작업 <span className="tl-count">{tasks.length}개</span></span>
        <span className="tl-sort">마감일 순 ↓</span>
      </div>

      <div className="tl-list">
        {tasks.map((task) => {
          const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
          const borderColor = BORDER_COLOR[task.priority] ?? "#6366f1";
          const assigneeNames = (task.assigneeIds ?? [task.assigneeId ?? ""])
            .map((id) => userById(id).name)
            .join(", ");

          return (
            <article key={task.id} className="tl-card" style={{ borderLeftColor: borderColor }}>
              {/* Top: priority + due */}
              <div className="tl-card-top">
                <span className={`tl-priority-badge ${pCfg.cls}`}>
                  <span className="tl-priority-icon">{pCfg.icon}</span>
                  {pCfg.label}
                </span>
                <span className="tl-due">
                  <Calendar size={13} strokeWidth={2} />
                  {formatDue(task.dueDate)}
                </span>
              </div>

              {/* Title */}
              <h3 className="tl-card-title">{task.title}</h3>

              {/* Bottom: assignees + status */}
              <div className="tl-card-bottom">
                <span className="tl-assignee-names">담당: {assigneeNames}</span>
                <StatusMenu taskId={task.id} current={task.status} onStatus={onStatus} />
              </div>
            </article>
          );
        })}

        {tasks.length === 0 && (
          <div className="tl-empty">할당된 작업이 없습니다</div>
        )}
      </div>
    </section>
  );
}
