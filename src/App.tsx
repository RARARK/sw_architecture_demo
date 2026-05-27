import { useEffect, useMemo, useState } from "react";
import { calendarEvents, messages as initialMessages, rooms, tasks as initialTasks, users } from "./data/mockData";
import { DemoGuidePanel, type DemoStepId } from "./components/common/DemoGuidePanel";
import { ToastMessage } from "./components/common/ToastMessage";
import { AppHeader } from "./components/layout/AppHeader";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { GuestInviteModal } from "./components/modals/GuestInviteModal";
import { RoomCreateModal } from "./components/modals/RoomCreateModal";
import { TaskAssignModal } from "./components/modals/TaskAssignModal";
import { DirectChatCreateModal } from "./components/modals/DirectChatCreateModal";
import { MyPageModal } from "./components/modals/MyPageModal";
import { ContextMenu } from "./components/overlays/ContextMenu";
import { SplitView } from "./components/overlays/SplitView";
import { CalendarView, TaskConversionModal } from "./components/views/CalendarView";
import { ChatView } from "./components/views/ChatView";
import { HomeDashboard } from "./components/views/HomeDashboard";
import { LoginView } from "./components/views/LoginView";
import { OrgChart } from "./components/views/OrgChart";
import { SettingsPanel } from "./components/views/SettingsPanel";
import { TaskBoard } from "./components/views/TaskBoard";
import type { Message, Room, Task, TaskStatus, User, RoomType } from "./types";
import type { RightPanel, TaskForm, Toast, View } from "./types/ui";
import { currentUser, taskStatusLabel, setDemoUsers, setCurrentUser } from "./utils/demo";

export function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState("lee.minsu@agency.com");
  const [password, setPassword] = useState("password123");
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [view, setView] = useState<View>("home");
  const [theme, setTheme] = useState<"light" | "dark">((localStorage.getItem("theme") as "light" | "dark") || "dark");

  const [usersList, setUsersList] = useState<User[]>(users);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User>(currentUser);
  const [myPageOpen, setMyPageOpen] = useState(false);

  useEffect(() => {
    setDemoUsers(usersList);
    setCurrentUser(activeUser);
  }, [usersList, activeUser]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [selectedRoomId, setSelectedRoomId] = useState("ROOM-002");
  const [roomList, setRoomList] = useState<Room[]>(rooms);
  const [rightPanel, setRightPanel] = useState<RightPanel>("tasks");
  const [messageMap, setMessageMap] = useState(initialMessages);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [contextMessage, setContextMessage] = useState<Message | null>(null);
  const [taskSourceMessage, setTaskSourceMessage] = useState<Message | null>(null);
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [calendarSyncTask, setCalendarSyncTask] = useState<Task | null>(null);
  const [splitMessage, setSplitMessage] = useState<Message | null>(null);
  const [searchText, setSearchText] = useState("REST API 설계");
  const [guestInviteOpen, setGuestInviteOpen] = useState(false);
  const [internalInviteOpen, setInternalInviteOpen] = useState(false);
  const [roomCreateOpen, setRoomCreateOpen] = useState(false);
  const [clickedUserForChat, setClickedUserForChat] = useState<User | null>(null);
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<DemoStepId>("login");
  const [guestNickname, setGuestNickname] = useState("이클라이언트");
  const [toast, setToast] = useState<Toast | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: "",
    assigneeIds: ["USER-003"],
    dueDate: "2026-05-23",
    priority: "HIGH",
    description: "유튜브 15초 버전 필수"
  });

  useEffect(() => {
    if (taskSourceMessage) {
      setTaskForm({
        title: taskSourceMessage.content.replace("해야함", "").trim(),
        assigneeIds: [activeUser.id],
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        priority: "MEDIUM",
        description: ""
      });
    }
  }, [taskSourceMessage, activeUser.id]);

  const selectedRoom = roomList.find((room) => room.id === selectedRoomId) ?? roomList[0];
  const selectedMessages = messageMap[selectedRoom.id] ?? [];
  const taskSourceIds = new Set(tasks.map((task) => task.sourceMessageId).filter(Boolean));

  const searchResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return Object.values(messageMap)
      .flat()
      .filter((message) => message.content.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messageMap, searchText]);

  const showToast = (text: string) => {
    const id = Date.now();
    setToast({ id, text });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  };

  const handleRegister = (newUser: { name: string; email: string; password?: string; department: string; part: string }) => {
    const tempId = `PENDING-${Date.now()}`;
    const avatar = newUser.name.slice(0, 2).toUpperCase();
    const pendingRecord: User = {
      id: tempId,
      email: newUser.email,
      name: newUser.name,
      department: newUser.department,
      position: "신입",
      avatar,
      status: "offline",
      role: "EMPLOYEE",
      part: newUser.part,
      password: newUser.password || "password123"
    };
    setPendingUsers((prev) => [...prev, pendingRecord]);
    showToast("승인 대기");
  };

  const handleApproveUser = (userId: string) => {
    const pending = pendingUsers.find((u) => u.id === userId);
    if (!pending) return;

    const newId = `USER-${String(usersList.length + 1).padStart(3, "0")}`;
    const approvedUser: User = {
      ...pending,
      id: newId,
      status: "online"
    };

    setUsersList((prev) => [...prev, approvedUser]);
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`${pending.name} 사원의 가입을 승인했습니다`);
  };

  const handleRejectUser = (userId: string) => {
    const pending = pendingUsers.find((u) => u.id === userId);
    if (!pending) return;

    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`${pending.name} 사원의 가입을 반려했습니다`);
  };

  const handleAddUser = (newUser: { name: string; email: string; department: string; part: string; position: string }) => {
    const newId = `USER-${String(usersList.length + 1).padStart(3, "0")}`;
    const avatar = newUser.name.slice(0, 2).toUpperCase();
    const userRecord: User = {
      id: newId,
      email: newUser.email,
      name: newUser.name,
      department: newUser.department,
      position: newUser.position,
      avatar,
      status: "online",
      role: "EMPLOYEE",
      part: newUser.part,
      password: "password123"
    };
    setUsersList((prev) => [...prev, userRecord]);
    showToast(`${newUser.name} 사원을 등록했습니다`);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setActiveUser(updatedUser);
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast("프로필이 수정되었습니다");
  };

  const handleLogin = () => {
    if (lockedUntil) {
      showToast("계정 잠금 시간이 끝난 뒤 다시 시도해 주세요");
      return;
    }

    const isPending = pendingUsers.find((user) => user.email === email);
    if (isPending) {
      showToast("승인 대기");
      return;
    }

    const validUser = usersList.find((user) => user.email === email);
    const validPassword = validUser?.password || "password123";
    if (!email.includes("@") || !validUser || password !== validPassword) {
      const nextFailedCount = failedLoginCount + 1;
      setFailedLoginCount(nextFailedCount);
      if (nextFailedCount >= 5) {
        setLockedUntil("30분 후");
      }
      showToast("Mock 계정을 확인해 주세요");
      return;
    }

    window.localStorage.setItem("messenger-demo-token", `mock-jwt-${validUser.id}`);
    setFailedLoginCount(0);
    setActiveUser(validUser);
    setIsAuthed(true);
    showToast(`${validUser.name}님, 환영합니다`);
  };

  const openRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setView("chat");
    setSplitMessage(null);
    showToast(`${roomList.find((room) => room.id === roomId)?.name ?? "채팅방"}으로 이동했습니다`);
  };

  const assignTask = () => {
    if (!taskSourceMessage || taskForm.assigneeIds.length === 0 || !taskForm.dueDate || !taskForm.title) {
      showToast("제목, 담당자 및 마감기한은 필수입니다");
      return;
    }

    const nextTask: Task = {
      id: `TASK-${String(tasks.length + 1).padStart(3, "0")}`,
      sourceMessageId: taskSourceMessage.id,
      sourceRoomId: taskSourceMessage.roomId,
      title: taskForm.title,
      description: taskForm.description,
      assigneeId: taskForm.assigneeIds[0],
      assigneeIds: taskForm.assigneeIds,
      createdBy: activeUser.id,
      status: "PENDING",
      priority: taskForm.priority,
      dueDate: `${taskForm.dueDate}T23:59:59Z`,
      createdAt: new Date().toISOString()
    };

    setTasks((current) => [nextTask, ...current]);
    setMessageMap((current) => ({
      ...current,
      [taskSourceMessage.roomId]: current[taskSourceMessage.roomId].map((message) =>
        message.id === taskSourceMessage.id ? { ...message, linkedTaskId: nextTask.id } : message
      )
    }));
    setRightPanel("tasks");
    setTaskSourceMessage(null);
    showToast("Task가 할당되었습니다");
  };

  const openTaskCreate = () => {
    setTaskForm({
      title: "",
      assigneeIds: [activeUser.id],
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: "MEDIUM",
      description: ""
    });
    setTaskCreateOpen(true);
  };

  const createTask = () => {
    if (taskForm.assigneeIds.length === 0 || !taskForm.dueDate || !taskForm.title.trim()) {
      showToast("제목, 담당자 및 마감기한은 필수입니다");
      return;
    }

    const nextTask: Task = {
      id: `TASK-${String(tasks.length + 1).padStart(3, "0")}`,
      sourceRoomId: selectedRoom.id,
      title: taskForm.title.trim(),
      description: taskForm.description,
      assigneeId: taskForm.assigneeIds[0],
      assigneeIds: taskForm.assigneeIds,
      createdBy: activeUser.id,
      status: "PENDING",
      priority: taskForm.priority,
      dueDate: `${taskForm.dueDate}T23:59:59Z`,
      createdAt: new Date().toISOString()
    };

    setTasks((current) => [nextTask, ...current]);
    setRightPanel("tasks");
    setTaskCreateOpen(false);
    showToast("작업이 생성되었습니다");
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task))
    );
    showToast(`작업 상태가 ${taskStatusLabel[status]}(으)로 변경되었습니다`);
  };

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setMessageMap((current) => {
      const next = { ...current };
      Object.keys(next).forEach((roomId) => {
        next[roomId] = next[roomId].map((message) =>
          message.linkedTaskId === taskId ? { ...message, linkedTaskId: undefined } : message
        );
      });
      return next;
    });
    showToast("작업이 삭제되었습니다");
  };

  const syncTaskToCalendar = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      showToast("동기화할 작업을 찾을 수 없습니다");
      return;
    }
    setCalendarSyncTask(task);
  };

  const createDirectRoom = (name: string, type: RoomType, inviteeIds: string[] = []) => {
    if (!clickedUserForChat) return;

    if (type === "DIRECT") {
      const existing = roomList.find(
        (room) =>
          room.type === "DIRECT" &&
          room.participants.includes("USER-001") &&
          room.participants.includes(clickedUserForChat.id)
      );
      if (existing) {
        openRoom(existing.id);
        setClickedUserForChat(null);
        return;
      }
    }

    const newRoom: Room = {
      id: `ROOM-${String(roomList.length + 1).padStart(3, "0")}`,
      name,
      type,
      description: type === "DIRECT" ? `${clickedUserForChat.name}님과의 대화방` : "조직도 기반 비공개 그룹방",
      participants: ["USER-001", clickedUserForChat.id, ...inviteeIds],
      createdAt: new Date().toISOString(),
      unreadCount: 0
    };

    setRoomList((current) => [...current, newRoom]);
    setMessageMap((current) => ({ ...current, [newRoom.id]: [] }));
    setSelectedRoomId(newRoom.id);
    setView("chat");
    setClickedUserForChat(null);
    showToast(`채팅방이 생성되었습니다`);
  };

  const sendMockMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      showToast("메시지를 입력해 주세요");
      return;
    }

    const next: Message = {
      id: `MSG-${Date.now()}`,
      roomId: selectedRoom.id,
      senderId: activeUser.id,
      content: trimmed,
      timestamp: new Date().toISOString(),
      readBy: [activeUser.id],
      unreadCount: 1
    };

    setMessageMap((current) => ({
      ...current,
      [selectedRoom.id]: [...(current[selectedRoom.id] ?? []), next]
    }));
    showToast("메시지가 전송되었습니다");
  };

  const inviteInternalMembers = (memberIds: string[]) => {
    if (selectedRoom.type === "DIRECT" || memberIds.length === 0) {
      return;
    }
    setRoomList((current) =>
      current.map((room) =>
        room.id === selectedRoom.id
          ? { ...room, participants: Array.from(new Set([...room.participants, ...memberIds])) }
          : room
      )
    );
    setInternalInviteOpen(false);
    showToast(`내부 멤버 ${memberIds.length}명을 초대했습니다`);
  };

  const handleViewChange = (nextView: View) => {
    setView(nextView);
    showToast(`${viewLabel[nextView]} 화면으로 이동했습니다`);
  };

  const runDemoStep = (step: DemoStepId) => {
    setDemoStep(step);
    if (step === "login") {
      showToast("Mock JWT 세션이 활성화되어 있습니다");
      return;
    }
    if (step === "room") {
      openRoom("ROOM-002");
      return;
    }
    if (step === "task") {
      const source = messageMap["ROOM-002"]?.find((message) => message.id === "MSG-002") ?? null;
      setSelectedRoomId("ROOM-002");
      setView("chat");
      setTaskSourceMessage(source);
      showToast("메시지 원문에서 Task 생성 모달을 열었습니다");
      return;
    }
    if (step === "search") {
      const target = messageMap["ROOM-001"]?.find((message) => message.content.includes("REST API")) ?? null;
      setSearchText("REST API");
      setSplitMessage(target);
      showToast("검색 결과를 Split-View로 열었습니다");
      return;
    }
    if (step === "guest") {
      setGuestInviteOpen(true);
      showToast("게스트 초대 플로우를 시작했습니다");
      return;
    }
    if (step === "calendar") {
      setView("calendar");
      showToast("일정이 Google Calendar에 추가되었습니다");
      return;
    }
    setView("settings");
    showToast("감사 패널을 열었습니다");
  };

  if (!isAuthed) {
    return (
      <LoginView
        email={email}
        password={password}
        toastText={toast?.text}
        failedCount={failedLoginCount}
        lockedUntil={lockedUntil}
        setEmail={setEmail}
        setPassword={setPassword}
        onLogin={handleLogin}
        onPasswordReset={() => showToast("15분 유효 비밀번호 재설정 링크가 발송되었습니다")}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <main className="app-shell">
      <AppHeader
        view={view}
        onViewChange={handleViewChange}
        theme={theme}
        onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        currentUser={activeUser}
        onProfileClick={() => setMyPageOpen(true)}
      />

      <section className="workspace">
        <LeftSidebar
          selectedRoomId={selectedRoomId}
          rooms={roomList}
          messageMap={messageMap}
          searchText={searchText}
          searchResults={searchResults}
          setSearchText={setSearchText}
          onOpenRoom={openRoom}
          onCreateRoom={() => setRoomCreateOpen(true)}
          onPickSearchResult={setSplitMessage}
        />

        <section className="main-surface">
          {view === "home" && (
            <HomeDashboard
              currentUser={activeUser}
              tasks={tasks}
              calendarEvents={calendarEvents}
              users={usersList}
              onCalendar={() => setView("calendar")}
              onOrg={() => {
                setView("org");
                setRightPanel("org");
              }}
              onOpenTask={() => handleViewChange("tasks")}
              onStatus={updateTaskStatus}
            />
          )}
          {view === "chat" && (
            <ChatView
              roomName={selectedRoom.name}
              roomDescription={selectedRoom.description}
              messages={selectedMessages}
              taskSourceIds={taskSourceIds}
              participantCount={selectedRoom.participants.length}
              onOpenMenu={setContextMessage}
              onSend={sendMockMessage}
              onInvite={() => setGuestInviteOpen(true)}
              onInviteInternal={selectedRoom.type === "GROUP_PRIVATE" ? () => setInternalInviteOpen(true) : undefined}
              isExternal={selectedRoom.participants.some((pId) => usersList.find((u) => u.id === pId)?.role === "GUEST")}
            />
          )}
          {view === "tasks" && (
            <TaskBoard
              tasks={tasks}
              rooms={roomList}
              onStatus={updateTaskStatus}
              onCreateTask={openTaskCreate}
              onDeleteTask={deleteTask}
              onSyncTask={syncTaskToCalendar}
            />
          )}
          {view === "calendar" && <CalendarView tasks={tasks} onSync={() => showToast("일정이 Google Calendar에 추가되었습니다")} showToast={showToast} />}
          {view === "org" && <OrgChart users={usersList} onPersonClick={(user) => setClickedUserForChat(user)} />}
          {view === "settings" && (
            <SettingsPanel
              usersList={usersList}
              pendingUsers={pendingUsers}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              rooms={roomList}
              messageMap={messageMap}
              onAddUser={handleAddUser}
            />
          )}
        </section>

        <RightSidebar
          rightPanel={rightPanel}
          tasks={tasks}
          setRightPanel={setRightPanel}
          onStatus={updateTaskStatus}
          onPersonClick={(user) => setClickedUserForChat(user)}
        />

        {splitMessage && (
          <SplitView
            message={splitMessage}
            messages={messageMap[splitMessage.roomId] ?? []}
            query={searchText}
            onClose={() => setSplitMessage(null)}
          />
        )}
      </section>

      {contextMessage && (
        <ContextMenu
          message={contextMessage}
          onClose={() => setContextMessage(null)}
          onAssign={() => {
            setTaskSourceMessage(contextMessage);
            setContextMessage(null);
          }}
          onCopy={() => {
            navigator.clipboard?.writeText(contextMessage.content);
            setContextMessage(null);
            showToast("메시지를 복사했습니다");
          }}
        />
      )}

      {taskSourceMessage && (
        <TaskAssignModal
          message={taskSourceMessage}
          form={taskForm}
          setForm={setTaskForm}
          onAssign={assignTask}
          onClose={() => setTaskSourceMessage(null)}
        />
      )}

      {taskCreateOpen && (
        <TaskAssignModal
          form={taskForm}
          setForm={setTaskForm}
          onAssign={createTask}
          onClose={() => setTaskCreateOpen(false)}
          title="작업 쓰기"
          submitLabel="생성"
        />
      )}

      {calendarSyncTask && (
        <TaskConversionModal
          task={calendarSyncTask}
          onClose={() => setCalendarSyncTask(null)}
          onConvert={() => {
            showToast("일정 동기화 완료");
            setCalendarSyncTask(null);
          }}
        />
      )}

      {guestInviteOpen && (
        <GuestInviteModal
          nickname={guestNickname}
          setNickname={setGuestNickname}
          onClose={() => setGuestInviteOpen(false)}
          onCreate={() => {
            setGuestInviteOpen(false);
            showToast("게스트 접근 플로우가 완료되었습니다");
          }}
        />
      )}

      {internalInviteOpen && (
        <InternalMemberInviteModal
          roomName={selectedRoom.name}
          existingParticipantIds={selectedRoom.participants}
          users={usersList}
          onClose={() => setInternalInviteOpen(false)}
          onInvite={inviteInternalMembers}
        />
      )}

      {roomCreateOpen && (
        <RoomCreateModal
          roomCount={roomList.length}
          onClose={() => setRoomCreateOpen(false)}
          onCreate={(room) => {
            setRoomList((current) => [...current, room]);
            setMessageMap((current) => ({ ...current, [room.id]: [] }));
            setSelectedRoomId(room.id);
            setView("chat");
            setRoomCreateOpen(false);
            showToast("조직도 기반 채팅방이 생성되었습니다");
          }}
        />
      )}

      {clickedUserForChat && (
        <DirectChatCreateModal
          key={clickedUserForChat.id}
          user={clickedUserForChat}
          onClose={() => setClickedUserForChat(null)}
          onCreate={createDirectRoom}
        />
      )}

      {myPageOpen && (
        <MyPageModal
          user={activeUser}
          onClose={() => setMyPageOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {toast && <ToastMessage text={toast.text} />}
      <DemoGuidePanel
        open={demoGuideOpen}
        currentStep={demoStep}
        onToggle={() => setDemoGuideOpen((value) => !value)}
        onRunStep={runDemoStep}
      />
    </main>
  );
}

const viewLabel: Record<View, string> = {
  home: "홈",
  chat: "채팅",
  tasks: "작업",
  calendar: "캘린더",
  org: "조직도",
  settings: "보안"
};

function InternalMemberInviteModal({
  roomName,
  existingParticipantIds,
  users,
  onClose,
  onInvite
}: {
  roomName: string;
  existingParticipantIds: string[];
  users: User[];
  onClose: () => void;
  onInvite: (memberIds: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const candidates = users.filter((user) => user.role !== "GUEST" && !existingParticipantIds.includes(user.id));

  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="내부 멤버 초대">
        <div className="modal-head">
          <h2>내부 멤버 초대</h2>
          <button className="icon-button" onClick={onClose} title="닫기">×</button>
        </div>
        <p className="modal-copy">{roomName}에 사내 멤버를 추가합니다.</p>
        <div className="internal-invite-list">
          {candidates.length > 0 ? (
            candidates.map((user) => {
              const checked = selectedIds.includes(user.id);
              return (
                <label key={user.id} className={`internal-invite-row ${checked ? "selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedIds((current) =>
                        checked ? current.filter((id) => id !== user.id) : [...current, user.id]
                      )
                    }
                  />
                  <span className="avatar">{user.avatar}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.department} · {user.position}</small>
                  </span>
                </label>
              );
            })
          ) : (
            <div className="inline-state">
              <strong>초대 가능한 사내 멤버가 없습니다</strong>
              <span>이미 모든 내부 멤버가 참여 중입니다.</span>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>취소</button>
          <button className="primary-action" disabled={selectedIds.length === 0} onClick={() => onInvite(selectedIds)}>
            초대
          </button>
        </div>
      </section>
    </div>
  );
}
