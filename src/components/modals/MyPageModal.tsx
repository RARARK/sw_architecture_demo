import { User as UserIcon, X, Save, Mail, Phone, Briefcase } from "lucide-react";
import { useState } from "react";
import type { User } from "../../types";

export function MyPageModal({
  user,
  onClose,
  onUpdate
}: {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [part, setPart] = useState(user.part || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...user,
      name,
      email,
      phone,
      part,
      avatar: name.slice(0, 2).toUpperCase()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }}>
      <section className="modal" aria-label="마이페이지" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserIcon size={20} className="accent-color" />
            마이페이지 (프로필 수정)
          </h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="avatar" style={{ width: 50, height: 50, fontSize: 16, borderRadius: "var(--radius-md)" }}>
              {name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>{user.name}</h3>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                {user.department} · {user.position}
              </p>
            </div>
          </div>

          <label>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            이메일 주소
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 36 }} required />
            </div>
          </label>

          <label>
            전화번호
            <div style={{ position: "relative" }}>
              <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ paddingLeft: 36 }} placeholder="010-XXXX-XXXX" />
            </div>
          </label>

          <label>
            부서 / 직급 (관리자 지정 항목)
            <div style={{ display: "flex", gap: 8 }}>
              <input value={user.department} disabled style={{ background: "var(--bg-elevated)", opacity: 0.7 }} />
              <input value={user.position} disabled style={{ background: "var(--bg-elevated)", opacity: 0.7 }} />
            </div>
          </label>

          <label>
            파트 담당 업무
            <div style={{ position: "relative" }}>
              <Briefcase size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={part} onChange={(e) => setPart(e.target.value)} style={{ paddingLeft: 36 }} placeholder="예: 프론트엔드 UI 개발" />
            </div>
          </label>

          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="secondary-action" onClick={onClose}>취소</button>
            <button type="submit" className="primary-action">
              <Save size={17} aria-hidden />
              저장하기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
