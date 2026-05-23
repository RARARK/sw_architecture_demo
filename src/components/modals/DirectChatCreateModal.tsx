import { MessageSquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { users } from "../../utils/demo";
import type { User, RoomType } from "../../types";

export function DirectChatCreateModal({
  user,
  onClose,
  onCreate
}: {
  user: User;
  onClose: () => void;
  onCreate: (roomName: string, roomType: RoomType, inviteeIds: string[]) => void;
}) {
  const [roomType, setRoomType] = useState<RoomType>("DIRECT");
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);

  useEffect(() => {
    if (!isNameManuallyEdited) {
      if (roomType === "DIRECT") {
        setRoomName(`${user.name} 1:1 대화방`);
      } else {
        const others = invitedUserIds.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean);
        const names = [user.name, ...others].join(", ");
        setRoomName(`${names} 그룹 대화방`);
      }
    }
  }, [roomType, invitedUserIds, user.name, isNameManuallyEdited]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreate(roomName.trim(), roomType, roomType === "GROUP_PRIVATE" ? invitedUserIds : []);
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="채팅방 생성" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <h2>새 채팅방 생성</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong>{user.name}</strong> ({user.department} · {user.position})님과 나눌 대화방을 개설합니다.
          </p>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
            방 유형
            <select
              value={roomType}
              onChange={(e) => {
                setRoomType(e.target.value as RoomType);
                setInvitedUserIds([]);
              }}
            >
              <option value="DIRECT">1:1 DM</option>
              <option value="GROUP_PRIVATE">그룹 비공개</option>
            </select>
          </label>

          {roomType === "GROUP_PRIVATE" && (
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>추가 참여자 초대</span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  maxHeight: 120,
                  overflowY: "auto",
                  padding: 8,
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                {users
                  .filter((u) => u.id !== "USER-001" && u.id !== user.id && u.role !== "GUEST")
                  .map((u) => {
                    const isChecked = invitedUserIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          cursor: "pointer",
                          background: isChecked ? "var(--bg-hover)" : "transparent",
                          color: "var(--text-primary)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: "1px solid var(--border-subtle)",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                          width: "fit-content"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setInvitedUserIds(invitedUserIds.filter((id) => id !== u.id));
                            } else {
                              setInvitedUserIds([...invitedUserIds, u.id]);
                            }
                          }}
                          style={{ width: "auto", margin: 0, flexShrink: 0, cursor: "pointer" }}
                        />
                        {u.name} ({u.position})
                      </label>
                    );
                  })}
              </div>
            </div>
          )}

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
            방 이름
            <input
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setIsNameManuallyEdited(true);
              }}
              placeholder="방 이름을 입력하세요"
              required
            />
          </label>

          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="secondary-action" onClick={onClose}>취소</button>
            <button type="submit" className="primary-action" disabled={!roomName.trim()}>
              <MessageSquarePlus size={17} aria-hidden />
              생성 및 입장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
