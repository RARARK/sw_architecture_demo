import { Search } from "lucide-react";
import { rooms } from "../../data/mockData";
import type { Message } from "../../types";

export function SearchBox({
  searchText,
  setSearchText,
  results,
  onPick
}: {
  searchText: string;
  setSearchText: (value: string) => void;
  results: Message[];
  onPick: (message: Message) => void;
}) {
  return (
    <section className="search-block">
      <label>
        <Search size={16} aria-hidden />
        <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="통합 검색" />
      </label>
      <div className="search-results">
        {searchText.trim() && <small className="result-count">{results.length}개 결과</small>}
        {searchText.trim() && results.length === 0 && (
          <div className="inline-state compact">
            <strong>검색 결과가 없습니다</strong>
            <span>다른 키워드나 채팅방 범위를 선택해 보세요.</span>
          </div>
        )}
        {results.slice(0, 3).map((message) => (
          <button key={message.id} onClick={() => onPick(message)}>
            <span>{message.content}</span>
            <small>{rooms.find((room) => room.id === message.roomId)?.name}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
