import { Code, MessageSquarePlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { users } from "../../utils/demo";
import type { Room } from "../../types";

export function RoomCreateModal({
  roomCount,
  onClose,
  onCreate
}: {
  roomCount: number;
  onClose: () => void;
  onCreate: (room: Room) => void;
}) {
  const [roomName, setRoomName] = useState("신규 캠페인 TF");
  const [selectedDepartment, setSelectedDepartment] = useState("개발팀");
  const [roomType, setRoomType] = useState<Room["type"]>("GROUP_PRIVATE");

  const departments = useMemo(
    () => Array.from(new Set(users.filter((user) => user.role !== "GUEST").map((user) => user.department))),
    []
  );
  const selectedUsers = users.filter((user) => user.department === selectedDepartment && user.id !== "USER-001");
  const canCreate = roomName.trim().length > 0 && selectedUsers.length > 0;

  const createRoom = () => {
    if (!canCreate) {
      return;
    }

    onCreate({
      id: `ROOM-${String(roomCount + 1).padStart(3, "0")}`,
      name: roomName.trim(),
      type: roomType,
      description: `${selectedDepartment} 조직도 기반 원클릭 생성`,
      participants: ["USER-001", ...selectedUsers.map((user) => user.id)],
      createdAt: new Date().toISOString(),
      unreadCount: 0
    });
  };

  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="조직도 기반 채팅방 생성">
        <div className="modal-head">
          <h2>조직도에서 채팅방 생성</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>
        <label>
          방 이름
          <input value={roomName} onChange={(event) => setRoomName(event.target.value)} />
        </label>
        <label>
          방 유형
          <select value={roomType} onChange={(event) => setRoomType(event.target.value as Room["type"])}>
            <option value="GROUP_PRIVATE">그룹 비공개</option>
            <option value="CHANNEL_PRIVATE">팀/부서 채널</option>
            <option value="DIRECT">1:1 DM</option>
          </select>
        </label>
        <label>
          부서 선택
          <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>
        <div className="selection-preview">
          <strong>자동 선택된 참여자 {selectedUsers.length}명</strong>
          <div>
            {selectedUsers.map((user) => (
              <span key={user.id} className="selection-chip">{user.name}</span>
            ))}
          </div>
        </div>
        <details className="dev-details">
          <summary className="dev-summary">
            <Code size={15} aria-hidden />
            <span>Validation</span>
          </summary>
          <code className="dev-code">{canCreate ? "requester excluded, participants > 0, leader scope verified" : "participants must be greater than 0"}</code>
        </details>
        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>취소</button>
          <button className="primary-action" onClick={createRoom} disabled={!canCreate}>
            <MessageSquarePlus size={17} aria-hidden />
            생성
          </button>
        </div>
      </section>
    </div>
  );
}
