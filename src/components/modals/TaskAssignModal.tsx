import { X } from "lucide-react";
import { users } from "../../utils/demo";
import type { Message, Priority } from "../../types";
import type { TaskForm } from "../../types/ui";

export function TaskAssignModal({
  message,
  form,
  setForm,
  onAssign,
  onClose
}: {
  message: Message;
  form: TaskForm;
  setForm: (form: TaskForm) => void;
  onAssign: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="Task 할당">
        <div className="modal-head">
          <h2>Task로 할당</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>
        <blockquote>{message.content}</blockquote>
        <label>
          작업 제목
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="작업 제목을 입력해 주세요"
          />
        </label>
        <label>
          담당자 지정
          <div className="task-assignee-picker">
            {form.assigneeIds.length > 0 && (
              <div className="task-assignee-chips">
                {form.assigneeIds.map((id) => {
                  const user = users.find((u) => u.id === id);
                  if (!user) return null;
                  return (
                    <span key={id} className="assignee-chip">
                      {user.name} ({user.position})
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => {
                          const nextIds = form.assigneeIds.filter((x) => x !== id);
                          setForm({ ...form, assigneeIds: nextIds });
                        }}
                        title="제거"
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="task-assignee-select-row" style={{ display: "flex", gap: "8px" }}>
              <select
                id="assignee-selector"
                value=""
                onChange={(event) => {
                  const val = event.target.value;
                  if (val && !form.assigneeIds.includes(val)) {
                    setForm({ ...form, assigneeIds: [...form.assigneeIds, val] });
                  }
                }}
                style={{ flex: 1 }}
              >
                <option value="" disabled>담당자 추가 선택...</option>
                {users
                  .filter((user) => user.role !== "GUEST" && !form.assigneeIds.includes(user.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.position})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </label>
        <label>
          마감기한
          <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
        </label>
        <label>
          우선순위
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}>
            <option value="LOW">낮음</option>
            <option value="MEDIUM">중간</option>
            <option value="HIGH">높음</option>
          </select>
        </label>
        <label>
          설명
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>취소</button>
          <button className="primary-action" onClick={onAssign}>할당</button>
        </div>
      </section>
    </div>
  );
}
