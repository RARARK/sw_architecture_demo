import { CheckCircle, ChevronLeft, ChevronRight, PanelRightOpen, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { calendarEvents as initialEvents } from "../../data/mockData";
import type { CalendarEvent, Task } from "../../types";
import { currentUser } from "../../utils/demo";

/* ── Constants ── */
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: "#4f7aff",
  PENDING:     "#f59e0b",
  DONE:        "#22c55e",
  HOLD:        "#ef4444",
};

type ViewMode = "month" | "week";

/* ── Helpers ── */
function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoToKey(iso: string): string { return iso.substring(0, 10); }

/* ── New Event Modal ── */
function NewEventModal({
  date,
  onClose,
  onCreate,
}: {
  date: string;
  onClose: () => void;
  onCreate: (title: string, startsAt: string, endsAt: string, description: string) => void;
}) {
  const [title,       setTitle]       = useState("");
  const [startsAt,    setStartsAt]    = useState(`${date}T09:00`);
  const [endsAt,      setEndsAt]      = useState(`${date}T10:00`);
  const [description, setDescription] = useState("");

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal cal-modal" aria-label="새 일정 추가">
        <div className="modal-head">
          <h2>새 일정 추가</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) onCreate(title.trim(), startsAt, endsAt, description); }}
          style={{ display: "grid", gap: 14 }}
        >
          <label>
            제목
            <input
              placeholder="일정 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
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
            설명
            <textarea
              placeholder="일정 설명 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose}>취소</button>
            <button type="submit" className="primary-action">
              <Plus size={15} />
              일정 추가
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* ── CalendarView ── */
export function CalendarView({
  tasks = [],
  onSync,
  showToast,
}: {
  tasks?: Task[];
  onSync: () => void;
  showToast: (msg: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toKey(today), [today]);

  const [curYear,  setCurYear]  = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen,    setModalOpen]    = useState(false);

  /* ── 동기화 상태 ── */
  const todaySyncKey = toKey(today);
  const [convertedTasks, setConvertedTasks] = useState<Record<string, string>>({});
  const [selectedTask,   setSelectedTask]   = useState<Task | null>(null);
  const [conversionOpen, setConversionOpen] = useState(false);

  const myTasks       = tasks.filter((t) =>
    t.assigneeIds ? t.assigneeIds.includes(currentUser.id) : t.assigneeId === currentUser.id
  );
  const pendingTasks   = myTasks.filter((t) => !convertedTasks[t.id]);
  const completedTasks = myTasks.filter((t) => convertedTasks[t.id] === todaySyncKey);

  function handleConvertTask(taskId: string) {
    setConvertedTasks((prev) => ({ ...prev, [taskId]: todaySyncKey }));
    showToast("일정 동기화 완료");
    setConversionOpen(false);
  }

  /* Navigation */
  function prev() {
    if (curMonth === 0) { setCurYear((y) => y - 1); setCurMonth(11); }
    else setCurMonth((m) => m - 1);
  }
  function next() {
    if (curMonth === 11) { setCurYear((y) => y + 1); setCurMonth(0); }
    else setCurMonth((m) => m + 1);
  }
  function goToday() {
    setCurYear(today.getFullYear());
    setCurMonth(today.getMonth());
  }

  /* Build grid */
  const calGrid = useMemo(() => {
    const first  = new Date(curYear, curMonth, 1);
    const last   = new Date(curYear, curMonth + 1, 0);
    const cells: (Date | null)[] = [];

    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(curYear, curMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [curYear, curMonth]);

  /* Build week grid (current week) */
  const weekGrid = useMemo(() => {
    const days: Date[] = [];
    const ref = new Date(today);
    ref.setDate(ref.getDate() - ref.getDay()); // Sunday of current week
    for (let i = 0; i < 7; i++) {
      const d = new Date(ref);
      d.setDate(ref.getDate() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  /* Map events + task-due-dates to date keys */
  const itemsByDate = useMemo(() => {
    const map: Record<string, { id: string; title: string; color: string; type: "event" | "task" }[]> = {};

    function add(key: string, item: { id: string; title: string; color: string; type: "event" | "task" }) {
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }

    for (const ev of localEvents) {
      add(isoToKey(ev.startsAt), { id: ev.id, title: ev.title, color: "#4f7aff", type: "event" });
    }
    for (const task of tasks) {
      if (task.dueDate) {
        add(isoToKey(task.dueDate), {
          id: task.id,
          title: task.title,
          color: STATUS_COLORS[task.status] ?? "#6366f1",
          type: "task",
        });
      }
    }
    return map;
  }, [localEvents, tasks]);

  function openCreate(date: Date) {
    setSelectedDate(toKey(date));
    setModalOpen(true);
  }

  function handleCreate(title: string, startsAt: string, endsAt: string, description: string) {
    setLocalEvents((prev) => [
      ...prev,
      { id: `EVT-${Date.now()}`, title, startsAt, endsAt, attendees: [], description },
    ]);
    showToast("일정이 추가되었습니다");
    setModalOpen(false);
  }

  /* ── Render helpers ── */
  function DayCell({ date, compact = false }: { date: Date; compact?: boolean }) {
    const key      = toKey(date);
    const isToday  = key === todayKey;
    const isSun    = date.getDay() === 0;
    const isSat    = date.getDay() === 6;
    const items    = itemsByDate[key] ?? [];
    const maxShow  = compact ? 2 : 3;

    return (
      <div
        className={`cal-cell ${isToday ? "today" : ""} ${isSun ? "sun" : isSat ? "sat" : ""}`}
        onClick={() => openCreate(date)}
      >
        <div className="cal-cell-top">
          <span className={`cal-day-num ${isToday ? "today-num" : ""}`}>{date.getDate()}</span>
          {items.length > 0 && (
            <button
              className="cal-cell-add"
              onClick={(e) => { e.stopPropagation(); openCreate(date); }}
              aria-label="일정 추가"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
        <div className="cal-cell-items">
          {items.slice(0, maxShow).map((it) => (
            <div
              key={it.id}
              className="cal-chip"
              style={{ background: `${it.color}1a`, color: it.color, borderLeft: `2px solid ${it.color}` }}
              onClick={(e) => e.stopPropagation()}
              title={it.title}
            >
              {it.title}
            </div>
          ))}
          {items.length > maxShow && (
            <span className="cal-chip-more">+{items.length - maxShow}개</span>
          )}
        </div>
      </div>
    );
  }

  /* ── Week view ── */
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 ~ 23:00

  return (
    <div className="calendar-view cal-root">
      <div className="cal-page-head">
        <h1 className="cal-page-title">캘린더</h1>
      </div>

      {/* ── Header ── */}
      <div className="cal-header">
        <div className="cal-nav">
          <button className="cal-today-btn" onClick={goToday}>오늘</button>
          <button className="cal-arrow" onClick={prev}><ChevronLeft size={18} /></button>
          <button className="cal-arrow" onClick={next}><ChevronRight size={18} /></button>
          <h2 className="cal-title">
            {curYear}년 {curMonth + 1}월
          </h2>
        </div>
        <div className="cal-actions">
          <div className="cal-view-tabs">
            <button className={`cal-view-btn ${viewMode === "month" ? "active" : ""}`} onClick={() => setViewMode("month")}>월간</button>
            <button className={`cal-view-btn ${viewMode === "week"  ? "active" : ""}`} onClick={() => setViewMode("week")}>주간</button>
          </div>
          <button className="cal-sync-btn" onClick={onSync}>
            <Plus size={15} />
            일정 동기화
          </button>
        </div>
      </div>

      {/* ── Month view ── */}
      {viewMode === "month" && (
        <div className="cal-grid-wrap">
          {/* Day-of-week headers */}
          <div className="cal-dow-row">
            {WEEK_DAYS.map((d, i) => (
              <div key={d} className={`cal-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="cal-month-grid">
            {calGrid.map((date, i) =>
              date
                ? <DayCell key={toKey(date)} date={date} />
                : <div key={`e-${i}`} className="cal-cell empty" />
            )}
          </div>
        </div>
      )}

      {/* ── Week view ── */}
      {viewMode === "week" && (
        <div className="cal-week-wrap">
          <div className="cal-week-head-row">
            <div className="cal-time-gutter" />
            {weekGrid.map((d) => {
              const isToday = toKey(d) === todayKey;
              return (
                <div key={toKey(d)} className={`cal-week-day-head ${isToday ? "today" : ""}`}>
                  <span className="cal-week-dow">{WEEK_DAYS[d.getDay()]}</span>
                  <span className={`cal-week-date ${isToday ? "today-num" : ""}`}>{d.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="cal-week-body">
            <div className="cal-week-times">
              {HOURS.map((h) => (
                <div key={h} className="cal-time-slot">
                  <span className="cal-time-label">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>
            {weekGrid.map((d) => {
              const key   = toKey(d);
              const items = itemsByDate[key] ?? [];
              return (
                <div key={key} className="cal-week-col" onClick={() => openCreate(d)}>
                  {HOURS.map((h) => <div key={h} className="cal-hour-cell" />)}
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="cal-week-event"
                      style={{ background: `${it.color}22`, color: it.color, borderLeft: `3px solid ${it.color}` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {it.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 일정 동기화 목록 (대기) ── */}
      <div className="cal-sync-section">
        <div className="cal-sync-head">
          <h3 className="cal-sync-title">일정 동기화 목록 (대기)</h3>
          <span className="cal-sync-badge pending">{pendingTasks.length}건</span>
        </div>
        {pendingTasks.length === 0 ? (
          <p className="cal-sync-empty">할당된 대기 작업이 없습니다.</p>
        ) : (
          <div className="cal-sync-list">
            {pendingTasks.map((task) => (
              <article key={task.id} className="cal-sync-row">
                <div className="cal-sync-row-body">
                  <span className="cal-sync-row-title">{task.title}</span>
                  <span className="cal-sync-row-meta">마감일: {new Date(task.dueDate).toLocaleDateString("ko-KR")}</span>
                </div>
                <button
                  className="cal-sync-row-btn"
                  onClick={() => { setSelectedTask(task); setConversionOpen(true); }}
                >
                  <PanelRightOpen size={14} />
                  일정 동기화
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── 오늘 동기화 완료 목록 ── */}
      <div className="cal-sync-section">
        <div className="cal-sync-head">
          <h3 className="cal-sync-title">오늘 동기화 완료 목록</h3>
          <span className="cal-sync-badge done">{completedTasks.length}건</span>
        </div>
        <p className="cal-sync-sub">오늘({todaySyncKey}) 일정 동기화를 완료한 작업만 표시됩니다.</p>
        {completedTasks.length === 0 ? (
          <p className="cal-sync-empty">오늘 동기화를 완료한 작업이 없습니다.</p>
        ) : (
          <div className="cal-sync-list">
            {completedTasks.map((task) => (
              <article key={task.id} className="cal-sync-row done">
                <div className="cal-sync-row-body">
                  <span className="cal-sync-row-title done">{task.title}</span>
                  <span className="cal-sync-row-meta done">
                    <CheckCircle size={13} /> 오늘 일정 동기화 완료
                  </span>
                </div>
                <span className="cal-sync-done-badge">동기화 완료</span>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── New event modal ── */}
      {modalOpen && selectedDate && (
        <NewEventModal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {/* ── Task conversion modal ── */}
      {conversionOpen && selectedTask && (
        <TaskConversionModal
          task={selectedTask}
          onClose={() => setConversionOpen(false)}
          onConvert={() => handleConvertTask(selectedTask.id)}
        />
      )}
    </div>
  );
}

/* ── Task Conversion Modal ── */
function TaskConversionModal({
  task,
  onClose,
  onConvert,
}: {
  task: Task;
  onClose: () => void;
  onConvert: () => void;
}) {
  const [title,       setTitle]       = useState(task.title);
  const [startsAt,    setStartsAt]    = useState("2026-05-24T10:00");
  const [endsAt,      setEndsAt]      = useState("2026-05-24T11:00");
  const [attendees,   setAttendees]   = useState("박지영, 강민혁");
  const [description, setDescription] = useState(`${task.title} 일정 변환`);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal cal-modal" aria-label="Task 일정 변환">
        <div className="modal-head">
          <h2>Task를 일정으로 변환</h2>
          <button className="icon-button" onClick={onClose} title="닫기"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onConvert(); }} style={{ display: "grid", gap: 14 }}>
          <label>제목<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
          <div className="field-grid">
            <label>시작<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></label>
            <label>종료<input type="datetime-local" value={endsAt}   onChange={(e) => setEndsAt(e.target.value)}   required /></label>
          </div>
          <label>참석자<input value={attendees}   onChange={(e) => setAttendees(e.target.value)} /></label>
          <label>설명<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose}>취소</button>
            <button type="submit" className="primary-action">일정 생성</button>
          </div>
        </form>
      </section>
    </div>
  );
}
