import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { CheckCheck, FileImage, FileText, LockKeyhole, MessageSquare, Send, ShieldCheck, X } from "lucide-react";

const invitedRoom = {
  name: "프로젝트 A 협업",
  description: "외부 클라이언트와의 협업 채팅",
  token: "invite-link-72h",
  securityCode: "123456",
  expiresAt: "2026-05-24 10:00"
};

type GuestAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
};

type GuestMessage = {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
  readState?: "sent" | "read";
  readLabel?: string;
  attachments?: GuestAttachment[];
};

const initialMessages: GuestMessage[] = [
  { id: "MSG-001", sender: "이민수", role: "내부 PM", text: "랜딩 페이지 톤 검토 부탁드립니다.", time: "09:10" },
  { id: "MSG-002", sender: "박지영", role: "디자인", text: "시안 2안을 먼저 확인해 주세요.", time: "09:16" },
  {
    id: "MSG-003",
    sender: "이클라이언트",
    role: "외부",
    text: "신뢰감 있는 톤으로 더 정리되면 좋겠습니다.",
    time: "09:20",
    readState: "read",
    readLabel: "All 읽음"
  }
];

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
};

export function GuestAccessApp() {
  const [email, setEmail] = useState("client@brandagency.com");
  const [nickname, setNickname] = useState("이클라이언트");
  const [token, setToken] = useState(invitedRoom.token);
  const [securityCode, setSecurityCode] = useState("123456");
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [attachments, setAttachments] = useState<GuestAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enterRoom = (event: FormEvent) => {
    event.preventDefault();
    if (token.trim() !== invitedRoom.token || securityCode.trim() !== invitedRoom.securityCode) {
      setError("초대 링크 또는 보안 번호가 올바르지 않습니다.");
      return;
    }
    window.localStorage.setItem(
      "messenger-guest-token",
      JSON.stringify({ role: "GUEST", room: "ROOM-003", nickname, email })
    );
    setEntered(true);
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || "application/octet-stream",
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
      }))
    ]);
    event.target.value = "";
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    const messageId = `MSG-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: messageId,
        sender: nickname,
        role: "외부",
        text: text || "첨부 파일을 보냈습니다.",
        time: "지금",
        readState: "sent",
        readLabel: "전송됨",
        attachments
      }
    ]);
    setDraft("");
    setAttachments([]);
    window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, readState: "read", readLabel: "All 읽음" } : message
        )
      );
    }, 900);
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    sendMessage();
  };

  if (entered) {
    return (
      <main className="guest-shell">
        <section className="guest-room">
          <header className="guest-room-head">
            <div>
              <span>Guest Access</span>
              <h1>{invitedRoom.name}</h1>
              <p>{invitedRoom.description}</p>
            </div>
            <div className="guest-security-chip">
              <ShieldCheck size={17} />
              초대 범위만 접근 가능
            </div>
          </header>

          <div className="guest-policy-band">
            조직도, 다른 채팅방, 인사 정보는 접근할 수 없습니다. 링크 만료: {invitedRoom.expiresAt}
          </div>

          <section className="guest-message-list">
            {messages.map((message) => (
              <article key={message.id} className={message.sender === nickname ? "mine" : ""}>
                <strong>{message.sender}</strong>
                <small>{message.role} · {message.time}</small>
                <p>{message.text}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="guest-message-attachments">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="guest-message-attachment">
                        {attachment.url ? (
                          <img src={attachment.url} alt={attachment.name} />
                        ) : (
                          <span className="guest-file-icon">
                            <FileText size={17} />
                          </span>
                        )}
                        <div>
                          <strong>{attachment.name}</strong>
                          <small>{attachment.size}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {message.sender === nickname && (
                  <div className={`guest-read-receipt ${message.readState === "read" ? "read" : ""}`}>
                    <CheckCheck size={14} />
                    {message.readLabel ?? "전송됨"}
                  </div>
                )}
              </article>
            ))}
          </section>

          {attachments.length > 0 && (
            <div className="guest-attachment-tray">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="guest-pending-attachment">
                  {attachment.url ? (
                    <img src={attachment.url} alt={attachment.name} />
                  ) : (
                    <span className="guest-file-icon">
                      <FileText size={16} />
                    </span>
                  )}
                  <div>
                    <strong>{attachment.name}</strong>
                    <small>{attachment.size}</small>
                  </div>
                  <button type="button" onClick={() => removeAttachment(attachment.id)} title="첨부 제거">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="guest-composer">
            <input
              ref={fileInputRef}
              className="guest-file-input"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <button type="button" title="파일 첨부" onClick={() => fileInputRef.current?.click()}>
              <FileImage size={17} />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              placeholder="메시지를 입력하세요"
            />
            <button className="guest-primary" type="button" onClick={sendMessage}>
              <Send size={17} />
              전송
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="guest-shell">
      <form className="guest-card" onSubmit={enterRoom}>
        <div className="guest-mark">
          <LockKeyhole size={30} />
        </div>
        <div>
          <span className="guest-eyebrow">External Secure Link</span>
          <h1>외부 클라이언트 접속</h1>
          <p>받은 초대 링크와 보안 번호를 확인한 뒤 지정된 채팅방에만 입장합니다.</p>
        </div>

        <label>
          초대 링크
          <input value={token} onChange={(event) => setToken(event.target.value)} />
        </label>
        <label>
          보안 번호
          <input value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} inputMode="numeric" />
        </label>
        <label>
          이메일
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          표시 이름
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={2} maxLength={20} />
        </label>

        {error && <div className="guest-error">{error}</div>}

        <button className="guest-primary" type="submit">
          <MessageSquare size={17} />
          채팅방 입장
        </button>

        <div className="guest-preview">
          <strong>{invitedRoom.name}</strong>
          <span>ROOM-003 허용 · 조직도/타 채팅방 접근 차단 · 72시간 유효</span>
        </div>
      </form>
    </main>
  );
}
