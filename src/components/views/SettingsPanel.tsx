import {
  BarChart3,
  Check,
  Ban,
  Lock,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Message, Room, User } from "../../types";

/* ─── Types ─────────────────────────────────────────────── */
interface AuditLogEntry {
  id: string;
  approverName: string;
  approverRole: string;
  approverInitials: string;
  approverColor: string;
  targetName: string;
  targetRole: string;
  targetInitials: string;
  targetColor: string;
  time: string;
  reason: string;
}

/* ─── Static Mock Data ──────────────────────────────────── */
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AL-001",
    approverName: "최성호", approverRole: "CSO", approverInitials: "CS", approverColor: "#6366f1",
    targetName: "이민수", targetRole: "대리", targetInitials: "LM", targetColor: "#22c55e",
    time: "2024.05.24 10:30:15", reason: "프로젝트 관련 분쟁 조사"
  },
  {
    id: "AL-002",
    approverName: "정수진", approverRole: "보안 관리자", approverInitials: "SJ", approverColor: "#f59e0b",
    targetName: "박지영", targetRole: "사원", targetInitials: "PJ", targetColor: "#8b5cf6",
    time: "2024.05.23 16:45:02", reason: "고객 문의 대응 확인"
  },
  {
    id: "AL-003",
    approverName: "최성호", approverRole: "CSO", approverInitials: "CS", approverColor: "#6366f1",
    targetName: "김민재", targetRole: "팀장", targetInitials: "KM", targetColor: "#22c55e",
    time: "2024.05.22 14:12:33", reason: "내부 정책 준수 여부 점검"
  },
  {
    id: "AL-004",
    approverName: "정수진", approverRole: "보안 관리자", approverInitials: "SJ", approverColor: "#f59e0b",
    targetName: "홍길동", targetRole: "주임", targetInitials: "HK", targetColor: "#3b82f6",
    time: "2024.05.21 09:18:07", reason: "보안 사고 경위 파악"
  },
  {
    id: "AL-005",
    approverName: "최성호", approverRole: "CSO", approverInitials: "CS", approverColor: "#6366f1",
    targetName: "서은지", targetRole: "사원", targetInitials: "SR", targetColor: "#f59e0b",
    time: "2024.05.20 11:05:44", reason: "업무 인수인계 확인"
  }
];

function getRoomTypeBadge(type: string) {
  const label =
    type === "GROUP" || type === "GROUP_PRIVATE" ? "그룹" :
    type === "DIRECT" ? "DM" :
    type === "NOTICE" ? "공지" : "Q&A";
  return (
    <span style={{ fontSize: 11, background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontWeight: 600 }}>
      {label}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export function SettingsPanel({
  usersList = [],
  pendingUsers = [],
  onApprove,
  onReject,
  rooms = [],
  messageMap = {},
  onAddUser: _onAddUser
}: {
  usersList?: User[];
  pendingUsers?: User[];
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  rooms?: Room[];
  messageMap?: Record<string, Message[]>;
  onAddUser?: (newUser: { name: string; email: string; department: string; part: string; position: string }) => void;
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [chatType, setChatType] = useState("그룹 채팅");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalMessages = Object.values(messageMap).flat().length;
  const activeRooms = rooms.length;
  const totalEmployees = usersList.filter((u) => u.role !== "GUEST").length;

  const handleSubmit = () => {
    if (!selectedUser) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="security-view">
      {/* Header */}
      <div className="security-view-header">
        <span className="sec-eyebrow">관리자 및 보안 감사</span>
        <h1>시스템 통합 제어 및 관리 도구</h1>
        <p>전체 사원, 채팅방, 메시지 현황을 관리하고 가입 요청 및 보안 감사를 통제합니다.</p>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="security-section-card">
          <div className="security-section-head">
            <div className="security-section-head-left">
              <h2 style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Users size={16} style={{ color: "var(--warning)" }} />
                가입 승인 대기 ({pendingUsers.length}건)
              </h2>
              <p>보안 검토 후 승인하면 메인 데이터와 동기화됩니다.</p>
            </div>
          </div>
          <div className="security-section-body" style={{ display: "grid", gap: 8 }}>
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
                  <strong style={{ fontSize: 13.5 }}>{u.name}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{u.email} · {u.department}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {onApprove && (
                    <button
                      onClick={() => onApprove(u.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: "var(--radius-sm)",
                        background: "var(--success)", color: "#fff",
                        fontSize: 12, fontWeight: 700, border: 0, cursor: "pointer"
                      }}
                    >
                      <Check size={13} /> 승인
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(u.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: "var(--radius-sm)",
                        background: "transparent", color: "var(--danger)",
                        border: "1px solid var(--danger)",
                        fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      <Ban size={13} /> 반려
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="security-stat-row">
        <div className="security-stat-card">
          <div className="security-stat-icon blue">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="security-stat-label">누적 메시지</p>
            <p className="security-stat-value">{totalMessages}건</p>
            <span className="security-stat-detail">전체 누적 메시지 수</span>
          </div>
        </div>
        <div className="security-stat-card">
          <div className="security-stat-icon green">
            <Users size={22} />
          </div>
          <div>
            <p className="security-stat-label">활성 채팅방 수</p>
            <p className="security-stat-value">{activeRooms}개</p>
            <span className="security-stat-detail">현재 활성화된 채팅방</span>
          </div>
        </div>
        <div className="security-stat-card">
          <div className="security-stat-icon gray">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="security-stat-label">등록 사원 수</p>
            <p className="security-stat-value">{totalEmployees}명</p>
            <span className="security-stat-detail">등록된 전체 사원 수</span>
          </div>
        </div>
      </div>

      {/* Chat Review Request Form */}
      <div className="security-section-card">
        <div className="security-section-head">
          <div className="security-section-head-left">
            <h2>채팅 열람 요청</h2>
            <p>업무상 필요한 경우, 채팅 열람을 요청할 수 있습니다.</p>
          </div>
        </div>
        <div className="security-section-body">
          {/* 1행: 대상자 선택 / 활성 유형 선택 / 요청 기한 */}
          <div className="sec-form-row">
            <div className="sec-form-group">
              <label htmlFor="sec-target">대상자 선택</label>
              <select id="sec-target" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">대상자를 선택하세요</option>
                {usersList.filter((u) => u.id !== "USER-001").map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                ))}
              </select>
            </div>
            <div className="sec-form-group">
              <label htmlFor="sec-chat-type">활성 유형 선택</label>
              <select id="sec-chat-type" value={chatType} onChange={(e) => setChatType(e.target.value)}>
                <option>그룹 채팅</option>
                <option>1:1 채팅</option>
                <option>채널</option>
              </select>
            </div>
            <div className="sec-form-group">
              <label htmlFor="sec-due">요청 기한</label>
              <input id="sec-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          {/* 2행: 열람 사유 (넓은 textarea) + 버튼 */}
          <div className="sec-form-group" style={{ marginBottom: 14 }}>
            <label htmlFor="sec-reason">열람 사유</label>
            <textarea
              id="sec-reason"
              placeholder="열람 사유를 입력하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ minHeight: 96, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="sec-cso-btn" onClick={handleSubmit} disabled={!selectedUser || submitted} type="button">
              <ShieldCheck size={16} />
              {submitted ? "요청 완료" : "CSO 승인 요청"}
            </button>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="security-section-card">
        <div className="security-section-head">
          <div className="security-section-head-left">
            <h2>Immutable Audit Log</h2>
            <p>승인자, 대상자, 시간, 사유를 영구 기록하며 최고 관리자도 수정/삭제할 수 없습니다.</p>
          </div>
          <span className="sec-immutable-badge">
            <Lock size={11} /> 수정/삭제 불가
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="sec-audit-table">
            <thead>
              <tr>
                <th>승인자</th>
                <th>대상자</th>
                <th>시간</th>
                <th>사유</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="sec-approver-cell">
                      <span className="sec-avatar" style={{ background: log.approverColor }}>{log.approverInitials}</span>
                      <div className="sec-approver-info">
                        <strong>{log.approverName}</strong>
                        <small>{log.approverRole}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="sec-approver-cell">
                      <span className="sec-avatar" style={{ background: log.targetColor }}>{log.targetInitials}</span>
                      <div className="sec-approver-info">
                        <strong>{log.targetName}</strong>
                        <small>{log.targetRole}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: 12.5 }}>{log.time}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room List Table */}
      <div className="security-section-card">
        <div className="security-section-head">
          <div className="security-section-head-left">
            <h2>채팅방 목록 관리 및 연동 현황</h2>
            <p>메인 페이지 대화방 및 참여 멤버, 메시지 송수신 건수를 실시간으로 감사 조율합니다.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="sec-room-table">
            <thead>
              <tr>
                <th>대화방 이름</th>
                <th>유형</th>
                <th>설명</th>
                <th>참여자 수</th>
                <th>메시지 수</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const msgCount = messageMap[room.id]?.length ?? 0;
                return (
                  <tr key={room.id}>
                    <td style={{ fontWeight: 700 }}>{room.name}</td>
                    <td>{getRoomTypeBadge(room.type)}</td>
                    <td style={{ color: "var(--text-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {room.description}
                    </td>
                    <td>{room.participants.length}명</td>
                    <td style={{ fontWeight: 700, color: "var(--accent-blue)" }}>{msgCount}건</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
