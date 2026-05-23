import { AtSign, CalendarPlus, FileImage, Mail, MessageCircle, MoreHorizontal, Paperclip, Send, UserPlus, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Message } from "../../types";
import { formatDate } from "../../utils/date";
import { currentUser, userById } from "../../utils/demo";

export function ChatView({
  roomName,
  roomDescription,
  messages,
  taskSourceIds,
  participantCount,
  onOpenMenu,
  onSend,
  onInvite,
  onInviteInternal,
  isExternal = false
}: {
  roomName: string;
  roomDescription: string;
  messages: Message[];
  taskSourceIds: Set<string | undefined>;
  participantCount: number;
  onOpenMenu: (message: Message) => void;
  onSend: (content: string) => void;
  onInvite: () => void;
  onInviteInternal?: () => void;
  isExternal?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mentionSuggestions = useMemo(() => {
    if (!draft.includes("@")) {
      return [];
    }
    return Array.from(new Set(messages.map((message) => message.senderId)))
      .map(userById)
      .filter((user) => user.id !== currentUser.id)
      .slice(0, 4);
  }, [draft, messages]);

  return (
    <div className="chat-view">
      <div className="content-head">
        <div>
          <span className="eyebrow">활성 채팅방</span>
          <h1>
            {roomName}
            {isExternal && <span className="external-tag-large">외부인 참여대화방</span>}
          </h1>
          <p>{roomDescription}</p>
        </div>
        <div className="chat-head-actions">
          <span className="participant-pill" title="참여 인원">
            <Users size={17} aria-hidden />
            {participantCount}
          </span>
          {onInviteInternal && (
            <button className="secondary-action" onClick={onInviteInternal}>
              <Users size={17} aria-hidden />
              멤버 초대
            </button>
          )}
          <button className="secondary-action" onClick={onInvite}>
            <UserPlus size={17} aria-hidden />
            게스트 초대
          </button>
        </div>
      </div>

      <div className="message-list">
        {messages.length === 0 && (
          <section className="inline-state" aria-label="채팅방 빈 상태">
            <strong>아직 메시지가 없습니다</strong>
            <span>첫 메시지를 보내면 읽음 상태와 Task 연결 흐름을 바로 확인할 수 있습니다.</span>
          </section>
        )}
        {messages.map((message) => {
          const sender = userById(message.senderId);
          return (
            <article key={message.id} className={`message ${sender.id === currentUser.id ? "mine" : ""}`}>
              <button className="avatar avatar-button" onClick={() => setProfileUserId(sender.id)} title={`${sender.name} 퀵 액션`}>
                {sender.avatar}
              </button>
              <div className="bubble">
                <div className="message-meta">
                  <strong>{sender.name}</strong>
                  <span>{formatDate(message.timestamp)}</span>
                  <button className="icon-button subtle" onClick={() => onOpenMenu(message)} title="메시지 메뉴">
                    <MoreHorizontal size={17} aria-hidden />
                  </button>
                </div>
                <p>{message.content}</p>
                <div className="message-foot">
                  {taskSourceIds.has(message.id) && <span className="badge">작업으로 등록됨</span>}
                  <span className="read-state">{message.unreadCount > 0 ? `✓ ${message.unreadCount}` : "all ✓"}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="message-composer">
        {mentionSuggestions.length > 0 && (
          <div className="mention-popover">
            {mentionSuggestions.map((user) => (
              <button key={user.id} onClick={() => setDraft(`${draft}${user.name} `)}>
                <AtSign size={15} aria-hidden />
                {user.name}에게 강조 알림
              </button>
            ))}
          </div>
        )}
        {attachedFile && (
          <div className="file-preview">
            <FileImage size={18} aria-hidden />
            <div>
              <strong>{attachedFile.name}</strong>
              <span>{attachedFile.type || "파일"} · {(attachedFile.size / 1024 / 1024).toFixed(2)}MB / 50MB · 전송 대기</span>
            </div>
            <button className="icon-button subtle" onClick={() => setAttachedFile(null)} title="첨부 취소">×</button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,.pdf,.doc,.docx,.xlsx,.ppt,.pptx,.txt"
          onChange={(event) => setAttachedFile(event.target.files?.[0] ?? null)}
        />
        <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="원본 파일 첨부">
          <Paperclip size={17} aria-hidden />
        </button>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="@이름 또는 메시지를 입력하세요" />
        <button
          className="primary-action"
          onClick={() => {
            const fileText = attachedFile ? `[파일 첨부] ${attachedFile.name}` : "";
            onSend([draft, fileText].filter(Boolean).join("\n"));
            setDraft("");
            setAttachedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <Send size={17} aria-hidden />
          전송
        </button>
      </div>

      {profileUserId && (
        <div className="profile-popover">
          <button className="icon-button" onClick={() => setProfileUserId(null)} title="닫기">×</button>
          <span className="avatar">{userById(profileUserId).avatar}</span>
          <h2>{userById(profileUserId).name}</h2>
          <p>{userById(profileUserId).department} · {userById(profileUserId).position}</p>
          {userById(profileUserId).part && (
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: -4, marginBottom: 8, background: "var(--bg-elevated)", padding: "4px 8px", borderRadius: 4, textAlign: "center" }}>
              담당: {userById(profileUserId).part}
            </p>
          )}
          <div className="quick-actions">
            <button><Mail size={16} aria-hidden />메일</button>
            <button><CalendarPlus size={16} aria-hidden />일정</button>
            <button><MessageCircle size={16} aria-hidden />1:1 채팅</button>
            <button><Users size={16} aria-hidden />조직도</button>
          </div>
        </div>
      )}
    </div>
  );
}
