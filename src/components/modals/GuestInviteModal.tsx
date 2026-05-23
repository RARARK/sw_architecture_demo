import { KeyRound, Link, Mail, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export function GuestInviteModal({
  nickname,
  setNickname,
  onClose,
  onCreate
}: {
  nickname: string;
  setNickname: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const [mode, setMode] = useState<"invite" | "relogin">("invite");

  return (
    <div className="modal-backdrop">
      <section className="modal" aria-label="게스트 초대">
        <div className="modal-head">
          <h2>게스트 접근 플로우</h2>
          <button className="icon-button" onClick={onClose} title="닫기">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flow-tabs">
          <button className={mode === "invite" ? "active" : ""} onClick={() => setMode("invite")}>
            매직링크 초대
          </button>
          <button className={mode === "relogin" ? "active" : ""} onClick={() => setMode("relogin")}>
            OTP 재로그인
          </button>
        </div>

        {mode === "invite" ? (
          <>
            <label>
              이메일
              <input defaultValue="client@brandagency.com" />
            </label>
            <label>
              TTL
              <select defaultValue="72">
                <option value="24">24시간</option>
                <option value="72">72시간</option>
                <option value="168">7일</option>
              </select>
            </label>
            <label>
              게스트 닉네임 설정
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </label>
            <div className="guest-preview">
              <Link size={18} aria-hidden />
              <span>/guest/invite-link-72h</span>
            </div>
            <div className="permission-preview">
              <ShieldCheck size={18} aria-hidden />
              <div>
                <strong>권한 모델</strong>
                <span>JWT role=GUEST, accessibleRoomIds=["ROOM-003"], orgChart=false</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary-action" onClick={onClose}>취소</button>
              <button className="primary-action" onClick={onCreate}>
                <Mail size={17} aria-hidden />
                링크 생성
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              초대 이메일
              <input defaultValue="client@brandagency.com" />
            </label>
            <label>
              OTP 코드
              <input defaultValue="123456" inputMode="numeric" />
            </label>
            <div className="guest-preview">
              <KeyRound size={18} aria-hidden />
              <span>만료 링크면 OTP 발송 후 접근 가능한 방만 복구</span>
            </div>
            <div className="permission-preview">
              <ShieldCheck size={18} aria-hidden />
              <div>
                <strong>접근 규칙</strong>
                <span>ROOM-003 허용, 조직도/타 채팅방/인사 정보는 403</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary-action" onClick={() => setMode("invite")}>초대로 돌아가기</button>
              <button className="primary-action" onClick={onCreate}>
                <KeyRound size={17} aria-hidden />
                재로그인
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
