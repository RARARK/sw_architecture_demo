import { FileLock2, Shield, Users, MessageSquare, BarChart3, Check, Ban } from "lucide-react";
import { Fragment, useState } from "react";
import type { Message, Room, User } from "../../types";

interface AuditLog {
  id: string;
  date: string;
  target: string;
  status: string;
}

export function SettingsPanel({
  usersList = [],
  pendingUsers = [],
  onApprove,
  onReject,
  rooms = [],
  messageMap = {},
  onAddUser
}: {
  usersList?: User[];
  pendingUsers?: User[];
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  rooms?: Room[];
  messageMap?: Record<string, Message[]>;
  onAddUser?: (newUser: { name: string; email: string; department: string; part: string; position: string }) => void;
}) {
  const [requested, setRequested] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [chatType, setChatType] = useState<"DIRECT" | "GROUP">("GROUP");
  const [logs, setLogs] = useState<AuditLog[]>([
    { id: "LOG-001", date: "2026.05.21", target: "HR_ADMIN (그룹)", status: "승인 대기" }
  ]);

  const handleRequest = () => {
    if (selectedUserIds.length === 0) return;
    const selectedUsers = selectedUserIds.map((id) => usersList.find((u) => u.id === id)).filter(Boolean) as User[];
    if (chatType === "DIRECT" && selectedUsers.some((user) => user.role !== "GUEST")) {
      setRequested(false);
      return;
    }

    setRequested(true);

    const selectedNames = selectedUsers.map((user) => user.name).join(", ");
    const typeLabel = chatType === "DIRECT" ? "외부 1:1" : "그룹";

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      date: "2026.05.23",
      target: `${selectedNames} (${typeLabel})`,
      status: "승인 대기"
    };

    setLogs((prev) => [...prev, newLog]);

    setTimeout(() => {
      setRequested(false);
    }, 1500);
  };

  // Compute stats
  const totalMessages = Object.values(messageMap).flat().length;
  const activeRoomsCount = rooms.length;
  const totalEmployees = usersList.filter((u) => u.role !== "GUEST").length;
  const selectableUsers = usersList.filter((u) => {
    if (u.id === "USER-001") {
      return false;
    }
    if (chatType === "DIRECT") {
      return u.role === "GUEST";
    }
    return true;
  });

  return (
    <section className="security-view">
      <div className="content-head">
        <div>
          <span className="eyebrow">관리자 및 보안 감사</span>
          <h1>시스템 통합 제어 및 관리 도구</h1>
          <p>전체 사원, 채팅방, 메시지 현황을 관리하고 가입 요청 및 보안 감사를 통제합니다.</p>
        </div>
      </div>

      {/* 통계 요약 (BarChart) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
        <article className="security-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
          <BarChart3 size={24} style={{ color: "var(--accent-blue)" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>누적 메시지 수</h3>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>{totalMessages}건</p>
          </div>
        </article>
        <article className="security-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
          <MessageSquare size={24} style={{ color: "var(--success)" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>활성 대화방 수</h3>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>{activeRoomsCount}개</p>
          </div>
        </article>
        <article className="security-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
          <Users size={24} style={{ color: "var(--accent-purple)" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>등록 사원 수</h3>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>{totalEmployees}명</p>
          </div>
        </article>
      </div>

      {/* 가입 승인 대기 목록 (Pending Approvals) */}
      {pendingUsers.length > 0 && (
        <article className="security-card" style={{ marginBottom: 20 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} style={{ color: "var(--warning)" }} />
            가입 승인 대기 목록 ({pendingUsers.length}건)
          </h2>
          <p>사원이 가입하면 보안 검토 후 승인을 눌러 메인 데이터와 동기화시킵니다.</p>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <strong style={{ fontSize: 14 }}>{u.name} (신입)</strong>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    이메일: {u.email} | 부서: {u.department} | 담당: {u.part}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {onApprove && (
                    <button
                      className="primary-action compact"
                      onClick={() => onApprove(u.id)}
                      style={{ padding: "4px 10px", fontSize: 12, minHeight: 28, background: "var(--success)" }}
                    >
                      <Check size={14} /> 승인
                    </button>
                  )}
                  {onReject && (
                    <button
                      className="secondary-action compact"
                      onClick={() => onReject(u.id)}
                      style={{ padding: "4px 10px", fontSize: 12, minHeight: 28, borderColor: "var(--danger)", color: "var(--danger)" }}
                    >
                      <Ban size={14} /> 반려
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* 관리 그리드 */}
      <div className="security-grid">
        {/* 보안 감사 (왼쪽 카드) */}
        <article className="security-card">
          <FileLock2 size={22} aria-hidden />
          <h2>채팅 열람 요청</h2>
          <p>내부 직원 간 1:1 대화는 열람 요청 대상에서 제외됩니다. 법적 근거가 필요한 개인 대화 열람은 서비스 운영사에 공식 이메일로 문의해 필요한 절차와 제출 서류를 확인해 주세요.</p>

          <div style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginTop: 8 }}>
            <span>대상자 선택 (다중 선택 가능, 외부인 포함)</span>
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
              {selectableUsers
                .map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  const isGuest = u.role === "GUEST";
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
                        color: isGuest ? "var(--accent-purple)" : "var(--text-primary)",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: isChecked ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
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
                            setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                          } else {
                            setSelectedUserIds([...selectedUserIds, u.id]);
                          }
                        }}
                        style={{ width: "auto", margin: 0, flexShrink: 0, cursor: "pointer" }}
                      />
                      {u.name} ({u.position}) {isGuest && <span style={{ fontSize: 10, color: "var(--accent-purple)" }}>[외부]</span>}
                    </label>
                  );
                })}
            </div>
          </div>

          <label style={{ marginTop: 8 }}>
            채팅 유형 선택
            <select
              value={chatType}
              onChange={(e) => {
                const nextType = e.target.value as "DIRECT" | "GROUP";
                setChatType(nextType);
                if (nextType === "DIRECT") {
                  setSelectedUserIds((current) =>
                    current.filter((id) => usersList.find((user) => user.id === id)?.role === "GUEST")
                  );
                }
              }}
            >
              <option value="GROUP">그룹 채팅 (단체)</option>
              <option value="DIRECT">외부 사용자 1:1</option>
            </select>
          </label>
          {chatType === "DIRECT" && (
            <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 700, marginTop: 6 }}>
              외부 사용자와의 1:1 대화만 요청할 수 있습니다. 내부 직원 간 개인 대화 열람은 법적 근거 확인이 필요하므로 서비스 운영사에 공식 이메일로 문의해 주세요.
            </div>
          )}

          <label style={{ marginTop: 8 }}>
            열람 사유
            <input defaultValue="보안 사고 조사 목적" />
          </label>
          <label style={{ marginTop: 8 }}>
            요청 기한
            <input type="date" defaultValue="2026-05-24" />
          </label>
          <button 
            className="secondary-action" 
            onClick={handleRequest}
            disabled={requested || selectedUserIds.length === 0}
            style={{ marginTop: 8 }}
          >
            CSO 승인 요청
          </button>
          {requested && (
            <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 700, marginTop: 4, textAlign: "center" }}>
              요청완료
            </div>
          )}
        </article>

        {/* 감사 로그 (오른쪽 카드) */}
        <article className="security-card">
          <Shield size={22} aria-hidden />
          <h2>Immutable Audit Log</h2>
          <p>승인자, 대상자, 시간, 사유를 영구 기록하며 최고 관리자도 수정/삭제할 수 없습니다.</p>
          <div className="audit-table">
            {logs.map((log) => (
              <Fragment key={log.id}>
                <span>{log.date}</span>
                <span title={log.target}>{log.target}</span>
                <span>{log.status}</span>
              </Fragment>
            ))}
          </div>
          <code>GET /api/v1/audit-logs</code>
        </article>
      </div>

      {/* 대화방 목록 관리 */}
      <article className="security-card" style={{ marginTop: 20 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={18} style={{ color: "var(--accent-blue)" }} />
          채팅방 목록 관리 및 연동 현황
        </h2>
        <p>메인 페이지 대화방 및 참여 멤버, 메시지 송수신 건수를 실시간으로 감사 조율합니다.</p>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>대화방 이름</th>
                <th style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>유형</th>
                <th style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>설명</th>
                <th style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>참여자 수</th>
                <th style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>메시지 수</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const msgCount = messageMap[room.id]?.length || 0;
                return (
                  <tr key={room.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 700 }}>{room.name}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{ fontSize: 11, background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 4 }}>
                        {room.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--text-muted)" }}>{room.description}</td>
                    <td style={{ padding: "10px 8px" }}>{room.participants.length}명</td>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--accent-blue)" }}>{msgCount}건</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
