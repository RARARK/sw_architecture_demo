import type { Priority } from "./index";

export type View = "home" | "chat" | "tasks" | "calendar" | "org" | "settings";
export type RightPanel = "org" | "tasks";

export interface Toast {
  id: number;
  text: string;
}

export interface TaskForm {
  title: string;
  assigneeIds: string[];
  dueDate: string;
  priority: Priority;
  description: string;
}
