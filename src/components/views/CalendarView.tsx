import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { calendarEvents as initialEvents } from "../../data/mockData";
import type { CalendarEvent, Task } from "../../types";

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
function toDateTimeInput(iso: string): string { return iso.substring(0, 16); }

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

function EventDetailModal({
  event,
  onClose,
  onSave,
  onDelete,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [startsAt, setStartsAt] = useState(toDateTimeInput(event.startsAt));
  const [endsAt, setEndsAt] = useState(toDateTimeInput(event.endsAt));
  const [attendees, setAttendees] = useState(event.attendees.join(", "));
  const [description, setDescription] = useState(event.description ?? "");

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal cal-modal" aria-label="일정 상세">
        <div className="modal-head">
          <h2>일정 상세</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onSave({
              ...event,
              title: title.trim(),
              startsAt,
              endsAt,
              attendees: attendees
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              description,
            });
          }}
          style={{ display: "grid", gap: 14 }}
        >
          <label>
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
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
            <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="쉼표로 구분" />
          </label>
          <label>
            설명
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <div className="modal-actions split">
            <button type="button" className="secondary-action danger" onClick={() => onDelete(event.id)}>삭제</button>
            <div className="modal-action-group">
              <button type="button" className="secondary-action" onClick={onClose}>취소</button>
              <button type="submit" className="primary-action">수정 저장</button>
            </div>
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const selectedEvent = localEvents.find((event) => event.id === selectedEventId) ?? null;

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
    const linkedTaskIds = new Set(localEvents.map((event) => event.linkedTaskId).filter(Boolean));

    function add(key: string, item: { id: string; title: string; color: string; type: "event" | "task" }) {
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }

    for (const ev of localEvents) {
      add(isoToKey(ev.startsAt), { id: ev.id, title: ev.title, color: "#4f7aff", type: "event" });
    }
    for (const task of tasks) {
      if (task.dueDate && !linkedTaskIds.has(task.id)) {
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

  function openEvent(eventId: string) {
    setSelectedEventId(eventId);
  }

  function handleCreate(title: string, startsAt: string, endsAt: string, description: string) {
    setLocalEvents((prev) => [
      ...prev,
      { id: `EVT-${Date.now()}`, title, startsAt, endsAt, attendees: [], description },
    ]);
    showToast("일정이 추가되었습니다");
    setModalOpen(false);
  }

  function handleUpdateEvent(nextEvent: CalendarEvent) {
    setLocalEvents((prev) => prev.map((event) => (event.id === nextEvent.id ? nextEvent : event)));
    showToast("일정이 수정되었습니다");
    setSelectedEventId(null);
  }

  function handleDeleteEvent(eventId: string) {
    setLocalEvents((prev) => prev.filter((event) => event.id !== eventId));
    showToast("일정이 삭제되었습니다");
    setSelectedEventId(null);
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
              onClick={(e) => {
                e.stopPropagation();
                if (it.type === "event") openEvent(it.id);
              }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (it.type === "event") openEvent(it.id);
                      }}
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

      {/* ── New event modal ── */}
      {modalOpen && selectedDate && (
        <NewEventModal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onSave={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

/* ── Task Conversion Modal ── */
export function TaskConversionModal({
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
