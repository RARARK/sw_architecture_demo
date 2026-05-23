import { ClipboardList, Copy, X } from "lucide-react";
import type { Message } from "../../types";

export function ContextMenu({
  message,
  onClose,
  onAssign,
  onCopy
}: {
  message: Message;
  onClose: () => void;
  onAssign: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="floating-menu" role="menu">
      <div className="floating-preview">{message.content}</div>
      <button onClick={onAssign}>
        <ClipboardList size={16} aria-hidden />
        Task로 할당
      </button>
      <button onClick={onCopy}>
        <Copy size={16} aria-hidden />
        복사
      </button>
      <button onClick={onClose}>
        <X size={16} aria-hidden />
        닫기
      </button>
    </div>
  );
}
