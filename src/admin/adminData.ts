export type AdminRole = "SUPER_ADMIN" | "ORG_ADMIN" | "HR_ADMIN" | "AUDIT_ADMIN";
export type AdminView = "dashboard" | "users" | "organization" | "positions" | "access" | "audit" | "offboarding" | "settings";
export type EmployeeStatus = "활성" | "미활성" | "퇴사 예정" | "퇴사" | "승인 대기";
export type AuditStatus = "대기" | "승인" | "거부";

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLoginAt: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: EmployeeStatus;
  joinedAt: string;
}

export interface Department {
  id: string;
  name: string;
  lead: string;
  memberCount: number;
  parentId: string | null;
  autoChannel: string;
  contact: string;
}

export interface AuditRequest {
  id: string;
  requester: string;
  target: string;
  room: string;
  reason: string;
  period: string;
  status: AuditStatus;
  createdAt: string;
}

export interface OffboardingCase {
  id: string;
  name: string;
  department: string;
  plannedDate: string;
  state: string;
  progress: number;
  tasks: string[];
  tokensRevoked: boolean;
}

export const adminAccounts: AdminAccount[] = [
  {
    id: "ADMIN-001",
    email: "lee.minsu@agency.com",
    name: "이민수",
    role: "SUPER_ADMIN",
    lastLoginAt: "2026-05-23 09:00",
    permissions: ["USER_CREATE", "USER_DELETE", "ORG_EDIT", "AUDIT_VIEW", "SYSTEM_SETTINGS"]
  },
  {
    id: "ADMIN-002",
    email: "kim.insa@agency.com",
    name: "김인사",
    role: "HR_ADMIN",
    lastLoginAt: "2026-05-23 08:30",
    permissions: ["USER_EDIT", "USER_OFFBOARD", "AUDIT_VIEW", "EMPLOYEE_HISTORY"]
  },
  {
    id: "ADMIN-003",
    email: "kang.minhyuk@agency.com",
    name: "강민혁",
    role: "ORG_ADMIN",
    lastLoginAt: "2026-05-23 07:45",
    permissions: ["USER_CREATE", "USER_EDIT", "ORG_EDIT", "POSITION_EDIT", "CHAT_MANAGE"]
  }
];

export const initialUsers: AdminUser[] = [
  { id: "USER-001", name: "이민수", email: "lee.minsu@agency.com", department: "기획팀", position: "팀장", role: "TEAM_LEAD", status: "활성", joinedAt: "2026-01-05" },
  { id: "USER-002", name: "박지훈", email: "park.jihun@agency.com", department: "개발팀", position: "신입", role: "EMPLOYEE", status: "활성", joinedAt: "2026-03-15" },
  { id: "USER-003", name: "박지영", email: "park.jiyoung@agency.com", department: "디자인팀", position: "주임", role: "EMPLOYEE", status: "활성", joinedAt: "2026-02-01" },
  { id: "USER-004", name: "강민혁", email: "kang.minhyuk@agency.com", department: "개발팀", position: "팀장", role: "TEAM_LEAD", status: "활성", joinedAt: "2026-01-10" },
  { id: "USER-005", name: "김인사", email: "kim.insa@agency.com", department: "인사팀", position: "과장", role: "TEAM_LEAD", status: "활성", joinedAt: "2026-01-15" },
  { id: "USER-006", name: "이채용", email: "lee.chaeyong@agency.com", department: "인사팀", position: "대리", role: "EMPLOYEE", status: "활성", joinedAt: "2026-02-15" },
  { id: "USER-007", name: "최마케", email: "choi.mkt@agency.com", department: "마케팅팀", position: "대리", role: "EMPLOYEE", status: "활성", joinedAt: "2026-02-10" },
  { id: "USER-008", name: "정홍보", email: "jung.pr@agency.com", department: "마케팅팀", position: "사원", role: "EMPLOYEE", status: "퇴사 예정", joinedAt: "2026-02-20" },
  { id: "USER-009", name: "홍길동", email: "hong.gildong@agency.com", department: "개발팀", position: "신입", role: "EMPLOYEE", status: "승인 대기", joinedAt: "2026-05-23" }
];

export const initialDepartments: Department[] = [
  { id: "DEPT-001", name: "기획팀", lead: "이민수", memberCount: 1, parentId: null, autoChannel: "기획팀", contact: "plan@agency.com" },
  { id: "DEPT-002", name: "개발팀", lead: "강민혁", memberCount: 2, parentId: null, autoChannel: "개발팀", contact: "dev@agency.com" },
  { id: "DEPT-003", name: "디자인팀", lead: "박지영", memberCount: 1, parentId: null, autoChannel: "디자인팀", contact: "design@agency.com" },
  { id: "DEPT-004", name: "인사팀", lead: "김인사", memberCount: 2, parentId: null, autoChannel: "인사팀", contact: "hr@agency.com" },
  { id: "DEPT-005", name: "마케팅팀", lead: "최마케", memberCount: 2, parentId: null, autoChannel: "마케팅팀", contact: "marketing@agency.com" }
];

export const positions = [
  { name: "대표", memberCount: 0, role: "SUPER_ADMIN", locked: true, permissions: ["시스템 전체 제어", "감사 열람", "설정 변경"] },
  { name: "팀장", memberCount: 2, role: "TEAM_LEAD", locked: true, permissions: ["채팅방 관리", "작업 할당", "팀원 상태 확인"] },
  { name: "과장/부장", memberCount: 1, role: "ORG_ADMIN", locked: false, permissions: ["조직 편집", "직급 관리"] },
  { name: "주임/대리", memberCount: 3, role: "EMPLOYEE", locked: true, permissions: ["멘토링", "일반 업무"] },
  { name: "사원/신입", memberCount: 3, role: "EMPLOYEE", locked: true, permissions: ["메시지 송수신", "작업 수행"] }
];

export const roomPermissions = [
  { name: "일일 스탠드업", type: "CHANNEL_PRIVATE", participants: 3, guest: false, owner: "강민혁" },
  { name: "3월 신규 캠페인 프로젝트", type: "GROUP_PRIVATE", participants: 3, guest: false, owner: "이민수" },
  { name: "프로젝트 A 협업", type: "GROUP_PRIVATE", participants: 3, guest: true, owner: "이민수" },
  { name: "1:1 박지훈", type: "DIRECT", participants: 2, guest: false, owner: "이민수" }
];

export const initialAuditRequests: AuditRequest[] = [
  { id: "AUDIT-001", requester: "이민수", target: "박지훈", room: "1:1 박지훈 DM", reason: "프로젝트 진행 상황 확인", period: "2026-05-21 ~ 2026-05-28", status: "대기", createdAt: "2026-05-21 14:00" },
  { id: "AUDIT-002", requester: "강민혁", target: "개발팀", room: "개발팀 일일 스탠드업", reason: "장애 대응 이력 확인", period: "2026-05-20", status: "승인", createdAt: "2026-05-20 18:30" }
];

export const auditLogs = [
  "2026-05-23 09:00  이민수가 로그인에 성공했습니다.",
  "2026-05-21 14:20  이민수가 박지훈 1:1 채팅 열람을 요청",
  "2026-05-20 10:15  김인사가 신규 사용자 가입 승인 완료"
];

export const initialOffboarding: OffboardingCase[] = [
  { id: "OFF-001", name: "정홍보", department: "마케팅팀", plannedDate: "2026-05-28", state: "임박", progress: 62, tasks: ["캠페인 데이터 분석 이관", "언론사 네트워크 전달"], tokensRevoked: false },
  { id: "OFF-002", name: "박지영", department: "디자인팀", plannedDate: "2026-06-03", state: "예정", progress: 38, tasks: ["디자인 파일 인수인계", "브랜드 가이드 정리"], tokensRevoked: false }
];
