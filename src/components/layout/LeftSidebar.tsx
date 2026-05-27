import { Plus, Search } from "lucide-react";
import type { Message, Room } from "../../types";
import { userById } from "../../utils/demo";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return "어제";
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function LeftSidebar({
  selectedRoomId,
  rooms,
  messageMap,
  searchText,
  searchResults,
  setSearchText,
  onOpenRoom,
  onCreateRoom,
  onPickSearchResult,
}: {
  selectedRoomId: string;
  rooms: Room[];
  messageMap: Record<string, Message[]>;
  searchText: string;
  searchResults: Message[];
  setSearchText: (value: string) => void;
  onOpenRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onPickSearchResult: (message: Message) => void;
}) {
  const avatarColors: Record<string, string> = {
    "ROOM-001": "#6366f1",
    "ROOM-002": "#f59e0b",
    "ROOM-003": "#22c55e",
    "ROOM-004": "#3b82f6",
  };

  return (
    <aside className="left-sidebar">
      {/* Search */}
      <label className="sidebar-search">
        <Search size={14} className="sidebar-search-icon" />
        <input
          type="text"
          placeholder="통합 검색 (채팅, 작업, 멤버 검색)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <kbd className="sidebar-search-kbd">⌘ K</kbd>
      </label>

      {/* Search Results */}
      {searchText.trim() && searchResults.length > 0 && (
        <div className="sidebar-search-results">
          {searchResults.map((msg) => {
            const sender = userById(msg.senderId);
            return (
              <button
                key={msg.id}
                className="sidebar-search-item"
                onClick={() => onPickSearchResult(msg)}
              >
                <span className="sidebar-search-item-name">{sender.name}</span>
                <span className="sidebar-search-item-content">{msg.content}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Room List Header */}
      <div className="sidebar-section-head">
        <span className="sidebar-section-label">채팅방 목록</span>
        <button className="sidebar-icon-btn" title="새 채팅방" onClick={onCreateRoom}>
          <Plus size={15} aria-hidden />
        </button>
      </div>

      {/* Room List */}
      <div className="sidebar-room-list">
        {rooms.map((room) => {
          const msgs = messageMap[room.id] ?? [];
          const lastMsg = msgs[msgs.length - 1];
          const lastSender = lastMsg ? userById(lastMsg.senderId) : null;
          const isSelected = selectedRoomId === room.id;
          const isExternal = room.participants.some((pId) => userById(pId).role === "GUEST");
          const bgColor = avatarColors[room.id] ?? "#6366f1";

          return (
            <button
              key={room.id}
              className={`sidebar-room-item ${isSelected ? "selected" : ""}`}
              onClick={() => onOpenRoom(room.id)}
            >
              <span className="sidebar-room-avatar" style={{ background: bgColor }}>
                {room.name[0]}
              </span>
              <div className="sidebar-room-body">
                <div className="sidebar-room-top">
                  <span className="sidebar-room-name">
                    {room.name}
                    {isExternal && <span className="sidebar-external-dot" />}
                  </span>
                  {lastMsg && (
                    <span className="sidebar-room-time">{formatTime(lastMsg.timestamp)}</span>
                  )}
                </div>
                <div className="sidebar-room-bottom">
                  {lastMsg && lastSender && (
                    <span className="sidebar-room-preview">
                      {lastSender.name}: {lastMsg.content}
                    </span>
                  )}
                  {room.unreadCount > 0 && (
                    <span className="sidebar-unread">{room.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button className="sidebar-more-btn" onClick={onCreateRoom}>
        채팅방 더 보기
      </button>
    </aside>
  );
}
