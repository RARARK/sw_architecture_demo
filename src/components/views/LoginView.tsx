import { Lock, LogIn, Mail, MessageSquare, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { ToastMessage } from "../common/ToastMessage";

export function LoginView({
  email,
  password,
  toastText,
  failedCount,
  lockedUntil,
  setEmail,
  setPassword,
  onLogin,
  onPasswordReset,
  onRegister
}: {
  email: string;
  password: string;
  toastText?: string;
  failedCount: number;
  lockedUntil: string | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onPasswordReset: () => void;
  onRegister: (newUser: { name: string; email: string; password?: string; department: string; part: string }) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDept, setRegDept] = useState("기획팀");
  const [regPart, setRegPart] = useState("");

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName && regEmail && regPassword && regDept && regPart) {
      onRegister({ name: regName, email: regEmail, password: regPassword, department: regDept, part: regPart });
      setMode("login");
      // Clear fields
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegPart("");
    }
  };

  const hasEmailWarning = email.length > 0 && !email.includes("@");
  const hasRegEmailWarning = regEmail.length > 0 && !regEmail.includes("@");

  return (
    <main className="login-shell">
      {mode === "login" ? (
        <section className="login-panel" aria-label="로그인">
          <div className="login-mark">
            <MessageSquare size={30} aria-hidden />
          </div>
          <h1>그룹웨어 메신저</h1>
          <p>메시지에서 업무까지 이어지는 SPA 데모</p>
          <label>
            이메일 주소
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} aria-hidden />
              <input value={email} onChange={(event) => setEmail(event.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            {hasEmailWarning && <span className="field-warning">이메일 형식을 확인하세요</span>}
          </label>
          <label>
            비밀번호
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} aria-hidden />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ paddingLeft: 40 }} />
            </div>
          </label>
          {lockedUntil && <div className="lockout-notice">로그인 5회 실패로 {lockedUntil}까지 잠금 처리됩니다.</div>}
          {failedCount > 0 && !lockedUntil && <div className="field-warning">로그인 실패 {failedCount}/5회</div>}
          <button className="primary-action" onClick={onLogin} disabled={Boolean(lockedUntil)}>
            <LogIn size={18} aria-hidden />
            로그인
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button className="text-action" onClick={onPasswordReset}>비밀번호 찾기</button>
            <button className="text-action" onClick={() => setMode("register")}>회원가입</button>
          </div>
        </section>
      ) : (
        <section className="login-panel" aria-label="회원가입">
          <div className="login-mark">
            <UserPlus size={30} aria-hidden />
          </div>
          <h1>사원 회원가입</h1>
          <p>새로운 계정을 생성합니다. 직급은 '신입'으로 지정됩니다.</p>
          <form onSubmit={handleRegisterSubmit} style={{ display: "grid", gap: 14 }}>
            <label>
              이름
              <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="홍길동" required />
            </label>
            <label>
              이메일 주소
              <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="gildong@agency.com" required />
              {hasRegEmailWarning && <span className="field-warning">이메일 형식을 확인하세요</span>}
            </label>
            <label>
              비밀번호
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="password" required />
            </label>
            <label>
              부서 선택
              <select value={regDept} onChange={(e) => setRegDept(e.target.value)} required>
                <option value="기획팀">기획팀</option>
                <option value="개발팀">개발팀</option>
                <option value="디자인팀">디자인팀</option>
                <option value="인사팀">인사팀</option>
                <option value="마케팅팀">마케팅팀</option>
              </select>
            </label>
            <label>
              파트 담당 업무
              <input value={regPart} onChange={(e) => setRegPart(e.target.value)} placeholder="예: 크리에이티브 광고 기획 / 프론트엔드 UI" required />
            </label>
            <button type="submit" className="primary-action" style={{ marginTop: 8 }}>
              가입 완료
            </button>
            <button type="button" className="text-action" onClick={() => setMode("login")} style={{ margin: "4px auto 0" }}>
              로그인 화면으로 돌아가기
            </button>
          </form>
        </section>
      )}
      {toastText && <ToastMessage text={toastText} />}
    </main>
  );
}
