import { Bell, CalendarDays, ClipboardList, PlusCircle, Users } from "lucide-react";
import { useRef, useState } from "react";
import type { CalendarEvent, Task, TaskStatus, User } from "../../types";
import { taskStatusLabel } from "../../utils/demo";

const DAYS_KO = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const PRIORITY_CONFIG: Record<string, { label: string; icon: string; cls: string }> = {
  HIGH:   { label: "높음", icon: "↑", cls: "tl-priority-high" },
  MEDIUM: { label: "중간", icon: "–", cls: "tl-priority-medium" },
  LOW:    { label: "낮음", icon: "↓", cls: "tl-priority-low" },
};
const BORDER_COLOR: Record<string, string> = {
  HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e",
};
const STATUS_ORDER: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "HOLD"];

function todayLabel() {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS_KO[d.getDay()]})`;
}
function formatDue(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 마감`;
}
function dueParts(iso: string) {
  const d = new Date(iso);
  return {
    month: `${String(d.getMonth() + 1).padStart(2, "0")}월`,
    day: String(d.getDate()).padStart(2, "0")
  };
}

export function HomeDashboard({
  currentUser,
  tasks,
  calendarEvents,
  users,
  onCalendar,
  onOrg,
  onOpenTask,
  onStatus,
}: {
  currentUser: User;
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  users: User[];
  onCalendar: () => void;
  onOrg: () => void;
  onOpenTask: () => void;
  onStatus: (taskId: string, status: TaskStatus) => void;
}) {
  const todayEvents = calendarEvents.filter((e) => {
    const d = new Date(e.startsAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  });
  const orgMembers = users.filter((u) => u.role !== "GUEST" && u.department === currentUser.department);

  return (
    <div className="home">
      {/* ── Top Widget Row ── */}
      <section className="wg-grid" aria-label="위젯">

        {/* Profile */}
        <article className="wg-card wg-profile">
          <div className="wg-profile-avatar">{currentUser.avatar}</div>
          <div className="wg-profile-greeting">
            <strong>{currentUser.name}님,</strong>
            <strong>안녕하세요.</strong>
          </div>
          <div className="wg-profile-date">
            <CalendarDays size={14} />
            {todayLabel()}
          </div>
          <div className="wg-profile-actions">
            <button className="wg-profile-btn"><PlusCircle size={15} /> 상태 설정</button>
            <button className="wg-profile-btn"><Bell size={15} /> 알림 일시 정지</button>
          </div>
        </article>

        {/* 캘린더 */}
        <article className="wg-card wg-calendar" onClick={onCalendar} style={{ cursor: "pointer" }}>
          <div className="wg-card-head">
            <div className="wg-card-icon wg-icon-purple"><CalendarDays size={18} /></div>
            <h3 className="wg-card-title">캘린더</h3>
          </div>
          {todayEvents.length > 0 ? (
            <div className="wg-event-list">
              {todayEvents.map((ev) => {
                const timeStr = new Date(ev.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={ev.id} className="wg-event-item">
                    <span className="wg-event-dot" />
                    <div>
                      <div className="wg-event-title">{ev.title}</div>
                      <div className="wg-event-time">{timeStr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="wg-empty-msg">오늘의 일정이 없습니다.</div>
          )}
          <span className="wg-card-link">일정 확인 및 추가 →</span>
        </article>

        {/* 조직도 */}
        <article className="wg-card wg-org" onClick={onOrg} style={{ cursor: "pointer" }}>
          <div className="wg-card-head">
            <div className="wg-card-icon wg-icon-teal"><Users size={18} /></div>
            <h3 className="wg-card-title">조직도</h3>
          </div>
          {orgMembers.length > 0 ? (
            <div className="wg-org-list">
              {orgMembers.map((u) => (
                <div key={u.id} className="wg-org-item">
                  <span className="wg-org-avatar">{u.avatar}</span>
                  <div className="wg-org-info">
                    <span className="wg-org-name">{u.name}</span>
                    <span className="wg-org-dept">{u.department} · {u.position}</span>
                  </div>
                  <span className={`wg-org-dot ${u.status}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="wg-empty-msg">표시할 팀원이 없습니다.</div>
          )}
          <span className="wg-card-link">전체보기 →</span>
        </article>
      </section>

      {/* ── 작업 위젯 (full width) ── */}
      <article className="wg-card wg-tasks">
        <div className="wg-card-head">
          <div className="wg-card-icon wg-icon-blue"><ClipboardList size={18} /></div>
          <h3 className="wg-card-title">진행 작업</h3>
          <span className="wg-task-count">{tasks.length}개</span>
          <button className="wg-card-link wg-task-all" onClick={onOpenTask}>모든 작업 보기 →</button>
        </div>

        {tasks.length === 0 ? (
          <div className="wg-empty-msg">할당된 작업이 없습니다.</div>
        ) : (
          <div className="wg-task-list">
            {tasks.map((task) => {
              const pCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
              const border = BORDER_COLOR[task.priority] ?? "#6366f1";
              const due = dueParts(task.dueDate);
              const assigneeNames = (task.assigneeIds ?? [task.assigneeId ?? ""])
                .map((id) => users.find((user) => user.id === id)?.name)
                .filter(Boolean)
                .join(", ");
              return (
                <div key={task.id} className="wg-task-row" style={{ borderLeftColor: border }}>
                  <div className="wg-task-date" aria-label={formatDue(task.dueDate)}>
                    <span>{due.month}</span>
                    <strong>{due.day}</strong>
                  </div>
                  <div className="wg-task-branch" aria-hidden="true">
                    <span style={{ backgroundColor: border }} />
                  </div>
                  <div className="wg-task-body">
                    <div className="wg-task-meta">
                      <span className={`tl-priority-badge ${pCfg.cls}`}>
                        <span className="tl-priority-icon">{pCfg.icon}</span>{pCfg.label}
                      </span>
                      <span className="wg-task-assignee">{assigneeNames || "담당자 미정"}</span>
                    </div>
                    <span className="wg-task-row-title">{task.title}</span>
                  </div>
                  <StatusMenu taskId={task.id} current={task.status} onStatus={onStatus} />
                </div>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}

/* ── Status Menu ── */
function StatusMenu({ taskId, current, onStatus }: {
  taskId: string; current: TaskStatus; onStatus: (id: string, s: TaskStatus) => void;
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
