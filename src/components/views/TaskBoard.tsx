import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Room, Task, TaskStatus } from "../../types";
import { userById } from "../../utils/demo";

/* ── Constants ── */
const STATUS_LABEL: Record<TaskStatus, string> = {
  IN_PROGRESS: "진행 중",
  PENDING:     "대기",
  DONE:        "완료",
  HOLD:        "보류",
};

const STATUS_CLS: Record<TaskStatus, string> = {
  IN_PROGRESS: "tb-badge-progress",
  PENDING:     "tb-badge-pending",
  DONE:        "tb-badge-done",
  HOLD:        "tb-badge-hold",
};

const AVATAR_PALETTE: Record<string, string> = {
  "USER-001": "#4f7aff",
  "USER-002": "#22c55e",
  "USER-003": "#f59e0b",
  "USER-004": "#14b8a6",
  "USER-005": "#f97316",
  "USER-006": "#8b5cf6",
  "USER-007": "#ec4899",
  "USER-008": "#06b6d4",
};
function avatarColor(id: string) { return AVATAR_PALETTE[id] ?? "#6366f1"; }

const STATUS_ORDER: TaskStatus[] = ["IN_PROGRESS", "PENDING", "DONE", "HOLD"];
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

type DueFilter = "ALL" | "TODAY" | "WEEK" | "OVERDUE";
type SortKey   = "newest" | "oldest" | "due";

/* ── Helpers ── */
function fmtCreated(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function fmtDue(iso: string): { text: string; urgent: boolean } {
  const d = new Date(iso);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  return {
    text: `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${DAYS[d.getDay()]})`,
    urgent: diff <= 3,
  };
}

/* ── Status Badge (clickable dropdown) ── */
function StatusBadge({ taskId, current, onStatus }: {
  taskId: string; current: TaskStatus; onStatus: (id: string, s: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="tl-status-wrap" ref={ref}>
      <button className={`tb-badge ${STATUS_CLS[current]}`} onClick={() => setOpen((v) => !v)}>
        {STATUS_LABEL[current]}
      </button>
      {open && (
        <div className="tl-status-menu">
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`tl-status-menu-item ${s === current ? "active" : ""}`}
              onClick={() => { onStatus(taskId, s); setOpen(false); }}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── TaskBoard ── */
export function TaskBoard({ tasks, rooms, onStatus, onCreateTask }: {
  tasks: Task[];
  rooms: Room[];
  onStatus: (taskId: string, status: TaskStatus) => void;
  onCreateTask: () => void;
}) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [dueFilter,    setDueFilter]    = useState<DueFilter>("ALL");
  const [sortBy,       setSortBy]       = useState<SortKey>("newest");
  const [page,         setPage]         = useState(1);
  const PAGE_SIZE = 10;

  const [starred, setStarred] = useState<Set<string>>(new Set());

  const roomById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of rooms) m[r.id] = r.name;
    return m;
  }, [rooms]);

  /* Filter + sort */
  const filtered = useMemo(() => {
    const now = Date.now();
    let list = [...tasks];

    if (statusFilter !== "ALL") list = list.filter((t) => t.status === statusFilter);

    if (dueFilter !== "ALL") list = list.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).getTime();
      const diff = Math.ceil((d - now) / 86_400_000);
      if (dueFilter === "TODAY")   return diff <= 0;
      if (dueFilter === "WEEK")    return diff <= 7;
      if (dueFilter === "OVERDUE") return diff < 0;
      return true;
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.assigneeIds ?? []).some((id) => userById(id).name.includes(q))
      );
    }

    if (sortBy === "newest")  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortBy === "oldest")  list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sortBy === "due")     list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return list;
  }, [tasks, statusFilter, dueFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function go(p: number) { setPage(Math.max(1, Math.min(p, totalPages))); }

  /* Tab counts */
  const TABS = [
    { key: "ALL",         label: "전체",   count: tasks.length },
    { key: "IN_PROGRESS", label: "진행 중", count: tasks.filter((t) => t.status === "IN_PROGRESS").length },
    { key: "PENDING",     label: "대기",   count: tasks.filter((t) => t.status === "PENDING").length },
    { key: "DONE",        label: "완료",   count: tasks.filter((t) => t.status === "DONE").length },
    { key: "HOLD",        label: "보류",   count: tasks.filter((t) => t.status === "HOLD").length },
  ] as const;

  return (
    <div className="task-board tb-list">

      {/* ── Page header ── */}
      <div className="tb-page-head">
        <div className="tb-page-head-row">
          <div>
            <h1 className="tb-page-title">작업 목록</h1>
            <p className="tb-page-desc">메시지에서 생성된 업무 상태를 한 곳에서 관리하세요.</p>
          </div>
          <button className="tb-create-button" type="button" onClick={onCreateTask}>
            <Plus size={16} aria-hidden />
            작업 쓰기
          </button>
        </div>
      </div>

      {/* ── Filter bar (4-item row) ── */}
      <div className="tb-filter-bar">
        <label className="tb-search-wrap">
          <Search size={15} className="tb-search-icon" />
          <input
            className="tb-search"
            placeholder="작업 제목, 담당자 검색"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </label>
        <select className="tb-filter-select" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | "ALL"); setPage(1); }}>
          <option value="ALL">상태 전체</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select className="tb-filter-select" value={dueFilter}
          onChange={(e) => { setDueFilter(e.target.value as DueFilter); setPage(1); }}>
          <option value="ALL">마감일 전체</option>
          <option value="TODAY">오늘 마감</option>
          <option value="WEEK">이번 주</option>
          <option value="OVERDUE">기한 초과</option>
        </select>
        <select className="tb-filter-select" value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}>
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="due">마감일순</option>
        </select>
      </div>

      {/* ── Status pill tabs ── */}
      <div className="tb-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tb-tab tb-tab-${tab.key.toLowerCase()} ${statusFilter === tab.key ? "active" : ""}`}
            onClick={() => { setStatusFilter(tab.key as TaskStatus | "ALL"); setPage(1); }}
          >
            {tab.label}
            <span className="tb-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="tb-table-wrap">
        <div className="tb-col-head">
          <span className="tbc-check" />
          <span className="tbc-star" />
          <span className="tbc-title">작업 제목</span>
          <span className="tbc-assignee">담당자</span>
          <span className="tbc-status">상태</span>
          <span className="tbc-due">마감일</span>
          <span className="tbc-created">생성일 ↓</span>
          <span className="tbc-more" />
        </div>

        {paginated.length === 0 ? (
          <div className="tb-empty-rows">조건에 맞는 작업이 없습니다.</div>
        ) : (
          paginated.map((task) => {
            const isStarred  = starred.has(task.id);
            const assignees  = (task.assigneeIds ?? [task.assigneeId ?? ""]).map((id) => userById(id));
            const due        = task.dueDate ? fmtDue(task.dueDate) : null;
            const roomName   = task.sourceRoomId ? roomById[task.sourceRoomId] : null;

            return (
              <div key={task.id} className="tb-row">
                <span className="tbc-check"><input type="checkbox" className="tb-checkbox" /></span>
                <span className="tbc-star">
                  <button className={`tb-star ${isStarred ? "on" : ""}`}
                    onClick={() => setStarred((prev) => {
                      const next = new Set(prev);
                      if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
                      return next;
                    })}
                    aria-label="즐겨찾기"
                  >★</button>
                </span>
                <div className="tbc-title">
                  <span className="tb-row-title">{task.title}</span>
                  {roomName && <span className="tb-row-tag">#{roomName}</span>}
                </div>
                <div className="tbc-assignee">
                  <div className="tb-avatars">
                    {assignees.slice(0, 2).map((u) => (
                      <span key={u.id} className="tb-avatar" style={{ background: avatarColor(u.id) }} title={u.name}>
                        {u.avatar}
                      </span>
                    ))}
                  </div>
                  <span className="tb-assignee-name">{assignees[0]?.name ?? "미정"}</span>
                </div>
                <div className="tbc-status">
                  <StatusBadge taskId={task.id} current={task.status} onStatus={onStatus} />
                </div>
                <span className={`tbc-due ${due?.urgent ? "urgent" : ""}`}>{due ? due.text : "—"}</span>
                <span className="tbc-created">{fmtCreated(task.createdAt)}</span>
                <span className="tbc-more">
                  <button className="tb-more-btn" aria-label="더보기"><MoreHorizontal size={16} /></button>
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Sticky pagination ── */}
      <div className="tb-footer">
        <button className="tb-page-btn" disabled={page <= 1} onClick={() => go(page - 1)}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} className={`tb-page-btn ${p === page ? "active" : ""}`} onClick={() => go(p)}>{p}</button>
        ))}
        <button className="tb-page-btn" disabled={page >= totalPages} onClick={() => go(page + 1)}>›</button>
      </div>

    </div>
  );
}
