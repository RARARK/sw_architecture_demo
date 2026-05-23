import { CalendarDays, PanelRightOpen, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { calendarEvents } from "../../data/mockData";
import type { CalendarEvent, Task } from "../../types";
import { formatDate } from "../../utils/date";
import { currentUser, userById } from "../../utils/demo";

export function CalendarView({ 
  tasks = [], 
  onSync, 
  showToast 
}: { 
  tasks?: Task[]; 
  onSync: () => void; 
  showToast: (msg: string) => void; 
}) {
  const [conversionOpen, setConversionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Track converted tasks and local calendar events
  const [convertedTasks, setConvertedTasks] = useState<Record<string, string>>({});
  const todayKey = "2026-05-23";

  // Filter tasks assigned to me (Lee Minsu, USER-001)
  const myTasks = tasks.filter((t) => 
    t.assigneeIds ? t.assigneeIds.includes(currentUser.id) : t.assigneeId === currentUser.id
  );

  // Split into pending and completed lists
  const pendingTasks = myTasks.filter((t) => !convertedTasks[t.id]);
  const completedTasks = myTasks.filter((t) => convertedTasks[t.id] === todayKey);

  const handleConvertTask = (
    taskId: string, 
    title: string, 
    startsAt: string, 
    endsAt: string, 
    attendees: string, 
    description: string
  ) => {
    setConvertedTasks((prev) => ({ ...prev, [taskId]: todayKey }));
    void title;
    void startsAt;
    void endsAt;
    void attendees;
    void description;
    showToast("일정 동기화 완료");
    setConversionOpen(false);
  };

  return (
    <div className="calendar-view">
      <div className="content-head">
        <div>
          <span className="eyebrow">캘린더</span>
          <h1>일정 동기화와 Task 전환</h1>
        </div>
        <button className="primary-action" onClick={onSync}>
          <CalendarDays size={17} aria-hidden />
          전체 동기화
        </button>
      </div>

      {/* 1. 일정 동기화 목록 (대기) - 위로 배치 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          일정 동기화 목록 (대기)
          <span style={{ fontSize: 12, background: "var(--warning)", color: "#000", padding: "2px 6px", borderRadius: 10, fontWeight: 700 }}>
            {pendingTasks.length}건
          </span>
        </h2>
        {pendingTasks.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0", padding: 12, background: "var(--bg-elevated)", borderRadius: 8 }}>
            할당된 대기 작업이 없습니다.
          </p>
        ) : (
          pendingTasks.map((task) => (
            <article key={task.id} className="event-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", marginBottom: 8, background: "var(--bg-elevated)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14 }}>{task.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                  마감일: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              <button 
                className="secondary-action compact" 
                onClick={() => {
                  setSelectedTask(task);
                  setConversionOpen(true);
                }}
              >
                <PanelRightOpen size={16} aria-hidden />
                일정 동기화
              </button>
            </article>
          ))
        )}
      </div>

      {/* 2. 완료 목록 (오늘 하루 기준) - 아래로 배치 */}
      <div style={{ marginBottom: 24, borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          오늘 동기화 완료 목록
          <span style={{ fontSize: 12, background: "var(--success)", color: "#fff", padding: "2px 6px", borderRadius: 10, fontWeight: 700 }}>
            {completedTasks.length}건
          </span>
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>
          오늘({todayKey}) 일정 동기화를 완료한 작업만 표시됩니다.
        </p>
        {completedTasks.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0", padding: 12, background: "var(--bg-elevated)", borderRadius: 8 }}>
            오늘 일정 동기화를 완료한 작업이 없습니다.
          </p>
        ) : (
          completedTasks.map((task) => (
            <article key={task.id} className="event-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", marginBottom: 8, background: "var(--bg-elevated)", borderRadius: 8, border: "1px solid var(--border-subtle)", opacity: 0.8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, textDecoration: "line-through", color: "var(--text-muted)" }}>{task.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={14} /> 오늘 일정 동기화 완료
                </p>
              </div>
              <span className="badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "var(--success)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                동기화 완료
              </span>
            </article>
          ))
        )}
      </div>
      {conversionOpen && selectedTask && (
        <TaskConversionModal 
          task={selectedTask} 
          onClose={() => setConversionOpen(false)} 
          onConvert={(title, startsAt, endsAt, attendees, description) => 
            handleConvertTask(selectedTask.id, title, startsAt, endsAt, attendees, description)
          } 
        />
      )}
    </div>
  );
}

function TaskConversionModal({ 
  task, 
  onClose, 
  onConvert 
}: { 
  task: Task; 
  onClose: () => void; 
  onConvert: (title: string, startsAt: string, endsAt: string, attendees: string, description: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [startsAt, setStartsAt] = useState("2026-05-24T10:00");
  const [endsAt, setEndsAt] = useState("2026-05-24T11:00");
  const [attendees, setAttendees] = useState("박지영, 강민혁");
  const [description, setDescription] = useState(`${task.title} 일정 변환`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert(title, startsAt, endsAt, attendees, description);
  };

  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="Task 일정 변환">
        <div className="modal-head">
          <h2>Task를 일정으로 변환</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <label>
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <div className="field-grid">
            <label>
              시작
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
            </label>
            <label>
              종료
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
            </label>
          </div>
          <label>
            참석자
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} />
          </label>
          <label>
            설명
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose}>취소</button>
            <button type="submit" className="primary-action">일정 생성</button>
          </div>
        </form>
      </section>
    </div>
  );
}
