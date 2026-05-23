import type { Task, TaskStatus } from "../../types";
import { dueDate } from "../../utils/date";
import { priorityLabel, taskStatusLabel, userById } from "../../utils/demo";

export function TaskList({ tasks, onStatus }: { tasks: Task[]; onStatus: (taskId: string, status: TaskStatus) => void }) {
  return (
    <section className="task-list">
      <h2>내 작업 ({tasks.length}개)</h2>
      {tasks.map((task) => (
        <article key={task.id} className="task-card">
          <div className="task-topline">
            <span className={`priority ${task.priority.toLowerCase()}`}>{priorityLabel[task.priority]}</span>
            <span>{dueDate(task.dueDate)} 마감</span>
          </div>
          <h3>{task.title}</h3>
          <p>담당: {task.assigneeIds ? task.assigneeIds.map((id) => userById(id).name).join(", ") : userById(task.assigneeId || "").name}</p>
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
  );
}
