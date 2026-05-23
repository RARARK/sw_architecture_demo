export type UserRole = "TEAM_LEAD" | "EMPLOYEE" | "GUEST";
export type UserStatus = "online" | "away" | "offline";
export type RoomType = "CHANNEL_PRIVATE" | "GROUP_PRIVATE" | "DIRECT";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "HOLD";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  department: string;
  position: string;
  avatar: string;
  status: UserStatus;
  role: UserRole;
  accessibleRoomIds?: string[];
  expiresAt?: string;
  part?: string;
  password?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  participants: string[];
  createdAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  unreadCount: number;
  linkedTaskId?: string;
}

export interface Task {
  id: string;
  sourceMessageId?: string;
  sourceRoomId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeIds: string[];
  createdBy: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendees: string[];
  linkedTaskId?: string;
  googleEventId?: string;
  description?: string;
}
