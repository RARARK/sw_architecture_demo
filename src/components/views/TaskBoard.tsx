import type { Task, TaskStatus } from "../../types";
import { dueDate } from "../../utils/date";
import { priorityLabel, taskStatusLabel, userById } from "../../utils/demo";

export function TaskBoard({ tasks, onStatus }: { tasks: Task[]; onStatus: (taskId: string, status: TaskStatus) => void }) {
  const columns: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "HOLD"];
  return (
    <div className="task-board">
      <div className="content-head">
        <div>
          <span className="eyebrow">작업 목록</span>
          <h1>메시지에서 생성된 업무 상태를 한 곳에서 관리</h1>
        </div>
      </div>
      <div className="board-columns">
        {columns.map((status) => (
          <section 
            key={status} 
            className={`board-column column-${status.toLowerCase()}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) {
                onStatus(taskId, status);
              }
            }}
          >
            <h2>{taskStatusLabel[status]}</h2>
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <article 
                  key={task.id} 
                  className="task-card"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task.id);
                  }}
                  style={{ cursor: "grab" }}
                >
                  <span className={`priority ${task.priority.toLowerCase()}`}>{priorityLabel[task.priority]}</span>
                  <h3>{task.title}</h3>
                  <p>{task.assigneeIds ? task.assigneeIds.map((id) => userById(id).name).join(", ") : userById(task.assigneeId || "").name} · {dueDate(task.dueDate)}</p>
                  <select
                    value={task.status}
                    onChange={(event) => onStatus(task.id, event.target.value as TaskStatus)}
                    className={`task-status-select status-${task.status.toLowerCase()}`}
                  >
                    {Object.entries(taskStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}
