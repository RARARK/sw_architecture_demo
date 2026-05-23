import { users as initialUsers } from "../data/mockData";
import type { Priority, TaskStatus, User } from "../types";

export let users: User[] = [...initialUsers];

export let currentUser = users[0];

export function setDemoUsers(newUsers: User[]) {
  users = [...newUsers];
}

export function setCurrentUser(user: User) {
  currentUser = user;
}

export const taskStatusLabel: Record<TaskStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
  HOLD: "지연"
};

export const priorityLabel: Record<Priority, string> = {
  LOW: "낮음",
  MEDIUM: "중간",
  HIGH: "높음"
};

export function userById(id: string): User {
  return users.find((user) => user.id === id) ?? users[0];
}

export function departmentGroups() {
  return users
    .filter((user) => user.role !== "GUEST")
    .reduce<Record<string, User[]>>((groups, user) => {
      groups[user.department] = groups[user.department] ? [...groups[user.department], user] : [user];
      return groups;
    }, {});
}
