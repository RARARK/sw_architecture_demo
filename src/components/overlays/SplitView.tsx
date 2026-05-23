import { X } from "lucide-react";
import { useEffect } from "react";
import type { Message } from "../../types";
import { formatDate } from "../../utils/date";
import { userById } from "../../utils/demo";

export function SplitView({
  message,
  messages,
  query,
  onClose
}: {
  message: Message;
  messages: Message[];
  query: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside className="split-view" aria-label="검색 결과 Split-View">
      <div className="split-head">
        <div>
          <span className="eyebrow">검색 결과</span>
          <h2>{query}</h2>
        </div>
        <button className="icon-button" onClick={onClose} title="닫기">
          <X size={18} aria-hidden />
        </button>
      </div>
      <ContextThread message={message} messages={messages} query={query} />
    </aside>
  );
}

function ContextThread({ message, messages, query }: { message: Message; messages: Message[]; query: string }) {
  const index = messages.findIndex((item) => item.id === message.id);
  const context = index === -1 ? [message] : messages.slice(Math.max(index - 10, 0), index + 11);
  return (
    <div className="context-thread">
      <div className="context-summary">
        {context.length}개 맥락 메시지 · ESC로 닫기
      </div>
      {context.map((item) => (
        <article key={item.id} className={item.id === message.id ? "highlighted-context" : ""}>
          <strong>{userById(item.senderId).name}</strong>
          <p>{highlight(item.content, query)}</p>
          <span>{formatDate(item.timestamp)}</span>
        </article>
      ))}
    </div>
  );
}

function highlight(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) {
    return text;
  }
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + trimmed.length)}</mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}
