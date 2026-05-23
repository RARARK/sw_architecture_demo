import { Plus } from "lucide-react";
import type { Message, Room } from "../../types";
import { userById } from "../../utils/demo";
import { SearchBox } from "./SearchBox";

export function LeftSidebar({
  selectedRoomId,
  rooms,
  searchText,
  searchResults,
  setSearchText,
  onOpenRoom,
  onCreateRoom,
  onPickSearchResult
}: {
  selectedRoomId: string;
  rooms: Room[];
  searchText: string;
  searchResults: Message[];
  setSearchText: (value: string) => void;
  onOpenRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onPickSearchResult: (message: Message) => void;
}) {
  return (
    <aside className="left-sidebar">
      <div className="sidebar-head">
        <h2>채팅방</h2>
        <button className="icon-button" title="새 채팅방" onClick={onCreateRoom}>
          <Plus size={18} aria-hidden />
        </button>
      </div>
      <div className="room-list">
        {rooms.map((room) => {
          const activeMembers = room.participants.map(userById).filter((user) => user.status === "online").slice(0, 3);
          const isExternalRoom = room.participants.some((pId) => userById(pId).role === "GUEST");
          return (
            <button
              key={room.id}
              className={`room-item ${selectedRoomId === room.id ? "selected" : ""}`}
              onClick={() => onOpenRoom(room.id)}
            >
              <span className="room-name">
                {room.name}
                {isExternalRoom && <span className="external-tag">외부 참여</span>}
              </span>
              <span className="room-desc">{room.description}</span>
            <span className="presence-row" aria-label="온라인 참여자">
              {activeMembers.map((user) => (
                <span key={user.id} className="presence-avatar" title={`${user.name} 온라인`}>
                  {user.avatar}
                </span>
              ))}
              <span className="presence-copy">{activeMembers.length} online</span>
            </span>
            {room.unreadCount > 0 && <span className="unread">{room.unreadCount}</span>}
          </button>
          );
        })}
      </div>
      <SearchBox searchText={searchText} setSearchText={setSearchText} results={searchResults} onPick={onPickSearchResult} />
    </aside>
  );
}
