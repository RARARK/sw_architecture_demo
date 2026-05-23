import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Download,
  FileClock,
  KeyRound,
  Lock,
  LogOut,
  MessageSquareLock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  Trash2,
  UserCog,
  Users
} from "lucide-react";
import {
  adminAccounts,
  auditLogs,
  initialAuditRequests,
  initialDepartments,
  initialOffboarding,
  initialUsers,
  positions,
  roomPermissions,
  type AdminAccount,
  type AdminUser,
  type AdminView,
  type AuditRequest,
  type Department,
  type EmployeeStatus,
  type OffboardingCase
} from "./adminData";

const navItems: Array<{ id: AdminView; label: string; icon: typeof Activity }> = [
  { id: "dashboard", label: "대시보드", icon: Activity },
  { id: "users", label: "사용자", icon: Users },
  { id: "organization", label: "조직", icon: Building2 },
  { id: "positions", label: "직급", icon: UserCog },
  { id: "access", label: "권한", icon: ShieldCheck },
  { id: "audit", label: "감사", icon: FileClock },
  { id: "offboarding", label: "퇴사자", icon: LogOut },
  { id: "settings", label: "설정", icon: Settings }
];

const departmentNames = ["개발팀", "마케팅팀", "디자인팀", "HR팀", "경영진실"];
const positionNames = ["대표", "팀장", "부장", "주임/대리", "사원/신입", "신입", "대리"];
const positionRoleMap: Record<string, string> = {
  대표: "SUPER_ADMIN",
  팀장: "TEAM_LEAD",
  "과장/부장": "ORG_ADMIN",
  "주임/대리": "EMPLOYEE",
  "사원/신입": "EMPLOYEE"
};

function getPositionGroup(position: string) {
  if (position === "대표") return "대표";
  if (position === "팀장") return "팀장";
  if (position === "과장" || position === "부장" || position === "과장/부장") return "과장/부장";
  if (position === "주임" || position === "대리" || position === "주임/대리") return "주임/대리";
  return "사원/신입";
}

export function AdminApp() {
  const [authedAdmin, setAuthedAdmin] = useState<AdminAccount | null>(null);
  const [email, setEmail] = useState("lee.minsu@agency.com");
  const [password, setPassword] = useState("admin123");
  const [view, setView] = useState<AdminView>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>(initialAuditRequests);
  const [offboarding, setOffboarding] = useState<OffboardingCase[]>(initialOffboarding);
  const [selectedUserId, setSelectedUserId] = useState("USER-002");
  const [selectedDeptId, setSelectedDeptId] = useState("DEPT-003");
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [selectedAuditId, setSelectedAuditId] = useState("AUDIT-001");
  const [selectedOffboardingId, setSelectedOffboardingId] = useState("OFF-001");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<EmployeeStatus | "전체">("전체");
  const [query, setQuery] = useState("");
  const [deptParentTarget, setDeptParentTarget] = useState("ROOT");
  const [accessTab, setAccessTab] = useState<"rooms" | "guests" | "requests">("rooms");
  const [draggedDeptId, setDraggedDeptId] = useState<string | null>(null);
  const [selectedPositionName, setSelectedPositionName] = useState("팀장");

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const selectedDepartment = departments.find((department) => department.id === selectedDeptId) ?? departments[0];
  const selectedAudit = auditRequests.find((request) => request.id === selectedAuditId) ?? auditRequests[0];
  const selectedOffboarding = offboarding.find((item) => item.id === selectedOffboardingId) ?? offboarding[0] ?? null;

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const statusMatch = userFilter === "전체" || user.status === userFilter;
      const queryMatch =
        !normalized ||
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.department.toLowerCase().includes(normalized);
      return statusMatch && queryMatch;
    });
  }, [query, userFilter, users]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2600);
  };

  const handleLogin = () => {
    const account = adminAccounts.find((admin) => admin.email === email);
    if (!account || password !== "admin123") {
      showToast("관리자 계정을 확인해 주세요");
      return;
    }
    setAuthedAdmin(account);
    showToast(`${account.name} 관리자님, 환영합니다`);
  };

  const addUser = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const department = String(data.get("department"));
    const nextUser: AdminUser = {
      id: `USER-${String(users.length + 1).padStart(3, "0")}`,
      name: String(data.get("name")),
      email: String(data.get("email")),
      department,
      position: String(data.get("position")),
      role: "EMPLOYEE",
      status: "활성",
      joinedAt: String(data.get("joinedAt"))
    };

    if (!nextUser.email.includes("@") || users.some((user) => user.email === nextUser.email)) {
      showToast("이메일 형식 또는 중복 여부를 확인해 주세요");
      return;
    }

    setUsers((current) => [nextUser, ...current]);
    setDepartments((current) =>
      current.map((departmentItem) =>
        departmentItem.name === department ? { ...departmentItem, memberCount: departmentItem.memberCount + 1 } : departmentItem
      )
    );
    setSelectedUserId(nextUser.id);
    setUserModalOpen(false);
    showToast(`${nextUser.name} 계정이 활성 상태로 생성되었습니다`);
  };

  const moveDepartmentToParent = (departmentId: string, targetParentId: string | null) => {
    const movingDepartment = departments.find((department) => department.id === departmentId);
    if (!movingDepartment) {
      return false;
    }
    if (targetParentId === departmentId) {
      showToast("자기 자신을 상위 부서로 지정할 수 없습니다");
      return false;
    }

    const isDescendant = (candidateParentId: string | null): boolean => {
      if (!candidateParentId) {
        return false;
      }
      if (candidateParentId === departmentId) {
        return true;
      }
      const parent = departments.find((department) => department.id === candidateParentId);
      return isDescendant(parent?.parentId ?? null);
    };

    if (isDescendant(targetParentId)) {
      showToast("하위 부서를 상위 부서로 지정할 수 없습니다");
      return false;
    }

    setDepartments((current) =>
      current.map((department) =>
        department.id === departmentId ? { ...department, parentId: targetParentId } : department
      )
    );
    const parentName = departments.find((department) => department.id === targetParentId)?.name ?? "회사 직속";
    showToast(`${movingDepartment.name}을 ${parentName}(으)로 이동했습니다`);
    return true;
  };

  const moveDepartment = () => {
    moveDepartmentToParent(selectedDepartment.id, deptParentTarget === "ROOT" ? null : deptParentTarget);
  };

  const addDepartment = (parentId: string | null) => {
    const nextDepartment: Department = {
      id: `DEPT-${String(departments.length + 1).padStart(3, "0")}`,
      name: `신규 부서 ${departments.length + 1}`,
      lead: "미지정",
      memberCount: 0,
      parentId,
      autoChannel: `신규 부서 ${departments.length + 1}`,
      contact: "new-team@company.com"
    };
    setDepartments((current) => [...current, nextDepartment]);
    setSelectedDeptId(nextDepartment.id);
    setDeptParentTarget(parentId ?? "ROOT");
    const parentName = departments.find((department) => department.id === parentId)?.name ?? "회사 직속";
    showToast(`${parentName}에 ${nextDepartment.name}를 추가했습니다`);
  };

  const deleteDepartment = () => {
    if (selectedDepartment.memberCount > 0) {
      showToast("인원이 있는 부서는 삭제할 수 없습니다");
      return;
    }
    setDepartments((current) => current.filter((department) => department.id !== selectedDepartment.id));
    setSelectedDeptId("DEPT-001");
    setDeptParentTarget("ROOT");
    showToast(`${selectedDepartment.name} 부서를 삭제했습니다`);
  };

  const changeSelectedUserStatus = (status: EmployeeStatus) => {
    setUsers((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, status } : user)));
    showToast(`${selectedUser.name} 상태가 ${status}(으)로 변경되었습니다`);
  };

  const saveSelectedUserRole = (role: string) => {
    setUsers((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, role } : user)));
    showToast(`${selectedUser.name} 권한을 ${role}(으)로 저장했습니다`);
  };

  const transferUserDepartment = (userId: string, nextDepartmentName: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user || user.department === nextDepartmentName) {
      return;
    }
    setUsers((current) =>
      current.map((item) => (item.id === userId ? { ...item, department: nextDepartmentName } : item))
    );
    setDepartments((current) =>
      current.map((department) => {
        if (department.name === user.department) {
          return { ...department, memberCount: Math.max(0, department.memberCount - 1) };
        }
        if (department.name === nextDepartmentName) {
          return { ...department, memberCount: department.memberCount + 1 };
        }
        return department;
      })
    );
    showToast(`${user.name}을 ${nextDepartmentName}(으)로 인사 이동했습니다`);
  };

  const updateUserPosition = (userId: string, nextPosition: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return;
    }
    const nextRole = positionRoleMap[nextPosition] ?? "EMPLOYEE";
    setUsers((current) =>
      current.map((item) =>
        item.id === userId ? { ...item, position: nextPosition, role: nextRole } : item
      )
    );
    setSelectedPositionName(nextPosition);
    showToast(`${user.name} 직급을 ${nextPosition}(으)로 변경했습니다`);
  };

  const startSelectedUserOffboarding = () => {
    const existingCase = offboarding.find((item) => item.name === selectedUser.name);
    if (existingCase) {
      setSelectedOffboardingId(existingCase.id);
      setView("offboarding");
      showToast(`${selectedUser.name}은 이미 퇴사자 목록에 있습니다`);
      return;
    }

    const nextCase: OffboardingCase = {
      id: `OFF-${String(offboarding.length + 1).padStart(3, "0")}`,
      name: selectedUser.name,
      department: selectedUser.department,
      plannedDate: "2026-05-31",
      state: "준비중",
      progress: 20,
      tasks: ["업무 인수인계 확인", "채팅방 권한 정리"],
      tokensRevoked: false
    };
    setOffboarding((current) => [nextCase, ...current]);
    setUsers((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, status: "퇴사 예정" } : user)));
    setSelectedOffboardingId(nextCase.id);
    setView("offboarding");
    showToast(`${selectedUser.name}을 퇴사자 목록에 추가했습니다`);
  };

  const approveAudit = () => {
    setAuditRequests((current) => current.map((request) => (request.id === selectedAudit.id ? { ...request, status: "승인" } : request)));
    setTwoFactorOpen(false);
    showToast("2FA 인증 완료. 감시 요청이 승인되었습니다");
  };

  const revokeTokens = () => {
    if (!selectedOffboarding) return;
    setOffboarding((current) =>
      current.map((item) => (item.id === selectedOffboarding.id ? { ...item, tokensRevoked: true, progress: Math.max(item.progress, 78) } : item))
    );
    showToast(`${selectedOffboarding.name}의 모든 세션이 종료되었습니다`);
  };

  const completeOffboarding = () => {
    if (!selectedOffboarding) return;
    setOffboarding((current) =>
      current.map((item) => (item.id === selectedOffboarding.id ? { ...item, state: "완료", progress: 100, tokensRevoked: true } : item))
    );
    setUsers((current) => current.map((user) => (user.name === selectedOffboarding.name ? { ...user, status: "퇴사" } : user)));
    showToast(`${selectedOffboarding.name} 계정이 비활성화되었습니다`);
  };

  const cancelOffboarding = (caseId: string) => {
    const caseItem = offboarding.find((c) => c.id === caseId);
    if (!caseItem) return;

    setOffboarding((current) => current.filter((item) => item.id !== caseId));
    setUsers((current) =>
      current.map((user) =>
        user.name === caseItem.name ? { ...user, status: "활성" } : user
      )
    );
    setSelectedOffboardingId((current) => (current === caseId ? offboarding.find((item) => item.id !== caseId)?.id ?? "" : current));
    showToast(`${caseItem.name} 사원이 정상 복귀되었습니다.`);
  };

  if (!authedAdmin) {
    return (
      <main className="admin-login-shell">
        <section className="admin-login-panel">
          <div className="admin-login-mark">
            <Lock size={28} />
          </div>
          <div>
            <p className="admin-eyebrow">Admin Control</p>
            <h1>관리자 패널</h1>
            <p>조직, 사용자 권한, 감사 로그를 통제하는 독립 관리자 데모입니다.</p>
          </div>
          <label>
            관리자 이메일
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            비밀번호
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="admin-primary" type="button" onClick={handleLogin}>
            <KeyRound size={17} /> 로그인
          </button>
        </section>
        {toast && <Toast text={toast} />}
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={21} />
          </div>
          <div>
            <strong>관리자 패널</strong>
            <span>Agency A Control</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="관리자 메뉴">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} type="button" onClick={() => setView(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="admin-role-box">
          <span>{authedAdmin.role}</span>
          <strong>{authedAdmin.name}</strong>
          <small>최근 로그인 {authedAdmin.lastLoginAt}</small>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">{viewTitle[view].eyebrow}</p>
            <h1>{viewTitle[view].title}</h1>
          </div>
          <div className="admin-top-actions">
            <button className="admin-icon-button" type="button" aria-label="내보내기" title="내보내기" onClick={() => showToast("CSV 내보내기를 준비했습니다")}>
              <Download size={18} />
            </button>
            <button className="admin-secondary compact" type="button" onClick={() => setAuthedAdmin(null)}>
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </header>

        {view === "dashboard" && (
          <Dashboard
            users={users}
            auditRequests={auditRequests}
            offboarding={offboarding}
            onGoUsers={() => setView("users")}
            onGoAudit={() => setView("audit")}
            onGoOrg={() => setView("organization")}
          />
        )}
        {view === "users" && (
          <UsersView
            users={filteredUsers}
            selectedUser={selectedUser}
            query={query}
            filter={userFilter}
            onQuery={setQuery}
            onFilter={setUserFilter}
            onSelect={setSelectedUserId}
            onAdd={() => setUserModalOpen(true)}
            onStatusChange={changeSelectedUserStatus}
            onRoleSave={saveSelectedUserRole}
            onOffboard={startSelectedUserOffboarding}
            onToast={showToast}
          />
        )}
        {view === "organization" && (
          <OrganizationView
            departments={departments}
            users={users}
            selectedDepartment={selectedDepartment}
            parentTarget={deptParentTarget}
            draggedDepartmentId={draggedDeptId}
            onSelect={setSelectedDeptId}
            onParentTarget={setDeptParentTarget}
            onAddDepartment={() => addDepartment(selectedDepartment.id)}
            onAddRootDepartment={() => addDepartment(null)}
            onDeleteDepartment={deleteDepartment}
            onDragDepartment={setDraggedDeptId}
            onDropDepartment={(targetParentId) => {
              if (!draggedDeptId) return;
              if (moveDepartmentToParent(draggedDeptId, targetParentId)) {
                setDraggedDeptId(null);
              }
            }}
            onTransferMember={transferUserDepartment}
            onToast={showToast}
          />
        )}
        {view === "positions" && (
          <PositionsView
            users={users}
            selectedPositionName={selectedPositionName}
            onSelectPosition={setSelectedPositionName}
            onUpdatePosition={updateUserPosition}
            onToast={showToast}
          />
        )}
        {view === "access" && (
          <AccessView
            selectedRoomIndex={selectedRoomIndex}
            activeTab={accessTab}
            onSelectRoom={setSelectedRoomIndex}
            onTab={setAccessTab}
            onGoAudit={() => setView("audit")}
            onToast={showToast}
          />
        )}
        {view === "audit" && (
          <AuditView
            requests={auditRequests}
            selectedRequest={selectedAudit}
            onSelect={setSelectedAuditId}
            onApprove={() => setTwoFactorOpen(true)}
            onDeny={() => {
              setAuditRequests((current) => current.map((request) => (request.id === selectedAudit.id ? { ...request, status: "거부" } : request)));
              showToast("감시 요청을 반려했습니다");
            }}
          />
        )}
        {view === "offboarding" && (
          <OffboardingView
            cases={offboarding}
            selectedCase={selectedOffboarding}
            onSelect={setSelectedOffboardingId}
            onRevoke={revokeTokens}
            onComplete={completeOffboarding}
            onCancelOffboarding={cancelOffboarding}
          />
        )}
        {view === "settings" && <SettingsView onToast={showToast} />}
      </section>

      {userModalOpen && <UserModal onClose={() => setUserModalOpen(false)} onSubmit={addUser} />}
      {twoFactorOpen && <TwoFactorModal onClose={() => setTwoFactorOpen(false)} onApprove={approveAudit} />}
      {toast && <Toast text={toast} />}
    </main>
  );
}

function Dashboard({
  users,
  auditRequests,
  offboarding,
  onGoUsers,
  onGoAudit,
  onGoOrg
}: {
  users: AdminUser[];
  auditRequests: AuditRequest[];
  offboarding: OffboardingCase[];
  onGoUsers: () => void;
  onGoAudit: () => void;
  onGoOrg: () => void;
}) {
  const activeUsers = users.filter((user) => user.status === "활성").length;
  return (
    <section className="admin-dashboard">
      <div className="admin-metric-grid">
        <Metric icon={Users} label="전체 사용자" value={`${users.length}명`} detail={`활성 ${activeUsers}명`} tone="blue" />
        <Metric icon={MessageSquareLock} label="활성 채팅방" value="16개" detail="게스트 포함 1개" tone="green" />
        <Metric icon={ShieldQuestion} label="감사 요청" value={`${auditRequests.filter((request) => request.status === "대기").length}건`} detail="2차 승인 필요" tone="amber" />
        <Metric icon={CalendarClock} label="퇴사 예정" value={`${offboarding.length}명`} detail="5월 말 집중" tone="red" />
      </div>

      <div className="admin-two-column">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>알림 및 업무</h2>
            <span className="admin-badge danger">주의</span>
          </div>
          <ActionRow title="퇴사 예정자 3명" meta="이준호 계정 비활성화 예정: 2026-05-28" />
          <ActionRow title="감사 요청 대기 1건" meta="박지훈 1:1 채팅 열람 승인 필요" />
          <ActionRow title="게스트 링크 만료 예정 2개" meta="내일 자동 폐기 예정" />
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>최근 활동</h2>
            <span className="admin-badge">최신순</span>
          </div>
          {auditLogs.slice(0, 4).map((log) => (
            <ActionRow key={log} title={log.slice(17)} meta={log.slice(0, 16)} />
          ))}
        </section>
      </div>

      <section className="admin-quick-band">
        <button type="button" onClick={onGoUsers}>
          <Plus size={18} /> 신규 사용자 추가
        </button>
        <button type="button" onClick={onGoOrg}>
          <Building2 size={18} /> 조직도 재편성
        </button>
        <button type="button" onClick={onGoAudit}>
          <FileClock size={18} /> 권한 요청 확인
        </button>
      </section>
    </section>
  );
}

function UsersView({
  users,
  selectedUser,
  query,
  filter,
  onQuery,
  onFilter,
  onSelect,
  onAdd,
  onStatusChange,
  onRoleSave,
  onOffboard,
  onToast
}: {
  users: AdminUser[];
  selectedUser: AdminUser;
  query: string;
  filter: EmployeeStatus | "전체";
  onQuery: (value: string) => void;
  onFilter: (value: EmployeeStatus | "전체") => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onStatusChange: (status: EmployeeStatus) => void;
  onRoleSave: (role: string) => void;
  onOffboard: () => void;
  onToast: (message: string) => void;
}) {
  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-toolbar">
          <button className="admin-primary" type="button" onClick={onAdd}>
            <Plus size={17} /> 신규 사용자
          </button>
          <label className="admin-search">
            <Search size={17} />
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="이름, 이메일, 부서 검색" />
          </label>
          <select value={filter} onChange={(event) => onFilter(event.target.value as EmployeeStatus | "전체")}>
            <option>전체</option>
            <option>활성</option>
            <option>미활성</option>
            <option>퇴사 예정</option>
            <option>퇴사</option>
            <option>승인 대기</option>
          </select>
        </div>
        <div className="admin-table">
          <div className="admin-table-row header">
            <span>이름</span>
            <span>부서</span>
            <span>직급</span>
            <span>이메일</span>
            <span>상태</span>
          </div>
          {users.map((user) => (
            <button key={user.id} className={`admin-table-row ${selectedUser.id === user.id ? "selected" : ""}`} type="button" onClick={() => onSelect(user.id)}>
              <span>{user.name}</span>
              <span>{user.department}</span>
              <span>{user.position}</span>
              <span>{user.email}</span>
              <StatusBadge status={user.status} />
            </button>
          ))}
        </div>
      </div>

      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>{selectedUser.name}</h2>
          <StatusBadge status={selectedUser.status} />
        </div>
        <dl className="admin-detail-list">
          <div><dt>이메일</dt><dd>{selectedUser.email}</dd></div>
          <div><dt>부서</dt><dd>{selectedUser.department}</dd></div>
          <div><dt>직급</dt><dd>{selectedUser.position}</dd></div>
          <div><dt>입사일</dt><dd>{selectedUser.joinedAt}</dd></div>
          <div><dt>권한</dt><dd>{selectedUser.role}</dd></div>
        </dl>
        <div className="admin-check-list">
          {["EMPLOYEE", "TEAM_LEAD", "ORG_ADMIN", "HR_ADMIN", "SUPER_ADMIN"].map((role) => (
            <label key={role}>
              <input
                type="radio"
                name={`role-${selectedUser.id}`}
                checked={selectedUser.role === role}
                onChange={() => onRoleSave(role)}
              />
              {role}
            </label>
          ))}
        </div>
        {selectedUser.status === "승인 대기" ? (
          <div className="admin-button-row">
            <button
              className="admin-primary full"
              type="button"
              onClick={() => {
                onStatusChange("활성");
                onToast(`${selectedUser.name} 사원의 가입을 승인했습니다`);
              }}
              style={{ width: "100%" }}
            >
              가입 승인
            </button>
          </div>
        ) : (
          <div className="admin-button-row">
            <button className="admin-secondary" type="button" onClick={() => onRoleSave(selectedUser.role)}>저장</button>
            <button
              className="admin-secondary"
              type="button"
              onClick={() => onStatusChange(selectedUser.status === "활성" ? "미활성" : "활성")}
            >
              {selectedUser.status === "활성" ? "비활성화" : "활성화"}
            </button>
            <button className="admin-secondary" type="button" onClick={() => onToast("비밀번호 초기화 링크가 발송되었습니다")}>비밀번호 초기화</button>
            <button className="admin-danger" type="button" onClick={onOffboard}>퇴사 처리</button>
          </div>
        )}
      </aside>
    </section>
  );
}

function OrganizationView({
  departments,
  users,
  selectedDepartment,
  parentTarget,
  draggedDepartmentId,
  onSelect,
  onParentTarget,
  onAddDepartment,
  onAddRootDepartment,
  onDeleteDepartment,
  onDragDepartment,
  onDropDepartment,
  onTransferMember,
  onToast
}: {
  departments: Department[];
  users: AdminUser[];
  selectedDepartment: Department;
  parentTarget: string;
  draggedDepartmentId: string | null;
  onSelect: (id: string) => void;
  onParentTarget: (id: string) => void;
  onAddDepartment: () => void;
  onAddRootDepartment: () => void;
  onDeleteDepartment: () => void;
  onDragDepartment: (id: string | null) => void;
  onDropDepartment: (targetParentId: string | null) => void;
  onTransferMember: (userId: string, nextDepartmentName: string) => void;
  onToast: (message: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [transferTargets, setTransferTargets] = useState<Record<string, string>>({});
  const rootDepartments = departments.filter((department) => !department.parentId);
  const childDepartments = (parentId: string) => departments.filter((department) => department.parentId === parentId);
  const departmentMembers = users.filter((user) => user.department === selectedDepartment.name);
  const movableDepartments = departments.filter((department) => department.name !== selectedDepartment.name);
  const renderDepartment = (department: Department, level = 0): ReactNode => (
    <div key={department.id} className="department-branch" style={{ marginLeft: `${16 + level * 24}px` }}>
      <button
        className={`${selectedDepartment.id === department.id ? "selected" : ""} ${draggedDepartmentId === department.id ? "dragging" : ""}`}
        type="button"
        draggable
        onClick={() => onSelect(department.id)}
        onDragStart={() => onDragDepartment(department.id)}
        onDragEnd={() => onDragDepartment(null)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onDropDepartment(department.id);
        }}
      >
        <ChevronRight size={16} />
        <strong>{department.name}</strong>
        <span>{department.memberCount}명</span>
        <MoreHorizontal size={16} />
      </button>
      {childDepartments(department.id).map((child) => renderDepartment(child, level + 1))}
    </div>
  );

  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-toolbar">
          <button className="admin-secondary" type="button" onClick={onAddRootDepartment}>
            <Plus size={17} /> 루트 부서
          </button>
          <button className="admin-primary" type="button" onClick={onAddDepartment}>
            <Plus size={17} /> 신규 부서
          </button>
        </div>
        <div className="department-tree">
          <div
            className="department-root"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onDropDepartment(null);
            }}
          >
            <Building2 size={18} /> 회사
          </div>
          {rootDepartments.map((department) => renderDepartment(department))}
        </div>
      </div>
      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>{selectedDepartment.name}</h2>
          <span className="admin-badge">{selectedDepartment.memberCount}명</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>부서장</dt><dd>{selectedDepartment.lead}</dd></div>
          <div><dt>연락처</dt><dd>{selectedDepartment.contact}</dd></div>
          <div><dt>자동 채팅방</dt><dd>{selectedDepartment.autoChannel}</dd></div>
          <div><dt>상위 부서</dt><dd>{departments.find((item) => item.id === selectedDepartment.parentId)?.name ?? "회사 직속"}</dd></div>
        </dl>
        <div className="department-member-list">
          <strong>{selectedDepartment.name} 멤버</strong>
          {departmentMembers.length > 0 ? (
            departmentMembers.map((member) => (
              <div key={member.id}>
                <span>{member.name}</span>
                <small>{member.position} · {member.email}</small>
                {editMode && movableDepartments.length > 0 && (
                  <div className="member-transfer-row">
                    <select
                      value={transferTargets[member.id] ?? movableDepartments[0].name}
                      onChange={(event) =>
                        setTransferTargets((current) => ({ ...current, [member.id]: event.target.value }))
                      }
                    >
                      {movableDepartments.map((department) => (
                        <option key={department.id} value={department.name}>{department.name}</option>
                      ))}
                    </select>
                    <button
                      className="admin-secondary compact"
                      type="button"
                      onClick={() => onTransferMember(member.id, transferTargets[member.id] ?? movableDepartments[0].name)}
                    >
                      이동
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <small>등록된 멤버가 없습니다</small>
          )}
        </div>
        <div className="admin-button-row">
          <button
            className="admin-secondary"
            type="button"
            onClick={() => {
              setEditMode((current) => !current);
              onToast(editMode ? "인사 이동 편집을 종료했습니다" : "인사 이동 편집을 시작했습니다");
            }}
          >
            {editMode ? "편집 종료" : "편집"}
          </button>
          <button className="admin-secondary" type="button" onClick={() => onToast(`${selectedDepartment.autoChannel} 채팅방 CSV를 저장했습니다`)}>채팅방 CSV 저장</button>
          <button className="admin-danger" type="button" onClick={onDeleteDepartment}><Trash2 size={16} /> 삭제</button>
        </div>
      </aside>
    </section>
  );
}

function PositionsView({
  users,
  selectedPositionName,
  onSelectPosition,
  onUpdatePosition,
  onToast
}: {
  users: AdminUser[];
  selectedPositionName: string;
  onSelectPosition: (positionName: string) => void;
  onUpdatePosition: (userId: string, nextPosition: string) => void;
  onToast: (message: string) => void;
}) {
  const [draftPositions, setDraftPositions] = useState<Record<string, string>>({});
  const selectedPosition = positions.find((position) => position.name === selectedPositionName) ?? positions[0];
  const selectedMembers = users.filter((user) => getPositionGroup(user.position) === selectedPosition.name);

  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-toolbar">
          <button className="admin-primary" type="button" onClick={() => onToast("신규 직급 모달을 열었습니다")}><Plus size={17} /> 신규 직급</button>
          <button className="admin-secondary" type="button" onClick={() => onToast("권한 템플릿을 저장했습니다")}><ShieldCheck size={17} /> 템플릿 관리</button>
        </div>
        <div className="position-grid">
          {positions.map((position, index) => {
            const memberCount = users.filter((user) => getPositionGroup(user.position) === position.name).length;
            return (
              <button
                className={`position-card ${selectedPosition.name === position.name ? "selected" : ""}`}
                key={position.name}
                type="button"
                onClick={() => onSelectPosition(position.name)}
              >
                <div className="position-rank">{index + 1}</div>
                <div>
                  <h2>{position.name}</h2>
                  <p>{position.role} · {memberCount}명</p>
                  <div className="admin-chip-row">
                    {position.permissions.map((permission) => <span key={permission}>{permission}</span>)}
                  </div>
                </div>
                <UserCog size={18} />
              </button>
            );
          })}
        </div>
      </div>
      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>{selectedPosition.name}</h2>
          <span className="admin-badge">{selectedMembers.length}명</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>기본 권한</dt><dd>{selectedPosition.role}</dd></div>
          <div><dt>삭제 가능</dt><dd>{selectedMembers.length === 0 ? "가능" : "멤버 있음"}</dd></div>
        </dl>
        <div className="position-member-list">
          {selectedMembers.length > 0 ? (
            selectedMembers.map((member) => (
              <div key={member.id} className="position-member-row">
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.department} · {member.email}</small>
                </div>
                <select
                  value={draftPositions[member.id] ?? getPositionGroup(member.position)}
                  onChange={(event) =>
                    setDraftPositions((current) => ({ ...current, [member.id]: event.target.value }))
                  }
                >
                  {positions.map((position) => (
                    <option key={position.name} value={position.name}>{position.name}</option>
                  ))}
                </select>
                <button
                  className="admin-secondary compact"
                  type="button"
                  onClick={() => onUpdatePosition(member.id, draftPositions[member.id] ?? getPositionGroup(member.position))}
                >
                  저장
                </button>
              </div>
            ))
          ) : (
            <div className="empty-admin-state">해당 직급 멤버가 없습니다.</div>
          )}
        </div>
      </aside>
    </section>
  );
}

function AccessView({
  selectedRoomIndex,
  activeTab,
  onSelectRoom,
  onTab,
  onGoAudit,
  onToast
}: {
  selectedRoomIndex: number;
  activeTab: "rooms" | "guests" | "requests";
  onSelectRoom: (index: number) => void;
  onTab: (tab: "rooms" | "guests" | "requests") => void;
  onGoAudit: () => void;
  onToast: (message: string) => void;
}) {
  const selectedRoom = roomPermissions[selectedRoomIndex] ?? roomPermissions[0];
  const isDirectRoom = selectedRoom.type === "DIRECT";
  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-tabs">
          <button className={activeTab === "rooms" ? "active" : ""} type="button" onClick={() => onTab("rooms")}>채팅방 권한</button>
          <button className={activeTab === "guests" ? "active" : ""} type="button" onClick={() => onTab("guests")}>게스트 관리</button>
          <button className={activeTab === "requests" ? "active" : ""} type="button" onClick={() => onTab("requests")}>감사 요청</button>
        </div>
        {activeTab === "rooms" && (
          <div className="admin-table permissions">
            <div className="admin-table-row header">
              <span>채팅방</span><span>유형</span><span>참여자</span><span>게스트</span><span>설정</span>
            </div>
            {roomPermissions.map((room, index) => (
              <button key={room.name} className={`admin-table-row ${selectedRoomIndex === index ? "selected" : ""}`} type="button" onClick={() => onSelectRoom(index)}>
                <span>{room.name}</span><span>{room.type}</span><span>{room.participants}명</span><span>{room.guest ? "포함" : "없음"}</span><span>관리</span>
              </button>
            ))}
          </div>
        )}
        {activeTab === "guests" && (
          <div className="admin-card-list">
            <ActionButton title="이클라이언트" meta="프로젝트 협업 · 2026-05-24 만료" onClick={() => onToast("게스트 링크를 72시간 연장했습니다")} />
            <ActionButton title="클라이언트 권한 회수" meta="스크린샷과 복사 제한 유지" onClick={() => onToast("게스트 접근 권한을 회수했습니다")} />
            <ActionButton title="활동 로그 보기" meta="최근 메시지 1건, 파일 다운로드 0건" onClick={() => onToast("게스트 활동 로그를 열었습니다")} />
          </div>
        )}
        {activeTab === "requests" && (
          <div className="admin-card-list">
            <ActionButton title="박지훈 1:1 채팅 열람 요청" meta="개인 대화는 관리자 패널에서 열람할 수 없음" onClick={() => onToast("개인 대화 열람은 차단되었습니다")} />
            <ActionButton title="개발팀 그룹 채팅 열람" meta="승인됨" onClick={onGoAudit} />
            <ActionButton title="마케팅팀 채팅 열람" meta="거부됨" onClick={onGoAudit} />
          </div>
        )}
      </div>
      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>{selectedRoom.name}</h2>
          <span className="admin-badge">{selectedRoom.type}</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>관리자</dt><dd>{selectedRoom.owner}</dd></div>
          <div><dt>참여자</dt><dd>{selectedRoom.participants}명</dd></div>
          <div><dt>게스트</dt><dd>{selectedRoom.guest ? "외부 게스트 1명" : "없음"}</dd></div>
        </dl>
        <div className="admin-check-list">
          {["메시지 편집 허용", "파일 첨부 허용", "게스트 스크린샷 금지", "게스트 메시지 복사 금지"].map((option) => (
            <label key={option}><input type="checkbox" defaultChecked onChange={() => onToast(`${option} 설정을 변경했습니다`)} />{option}</label>
          ))}
        </div>
        <div className="chat-viewer-preview">
          <strong>{isDirectRoom ? "개인 대화 열람 차단" : "채팅방 권한 저장"}</strong>
          <p>{isDirectRoom ? "1:1 개인 대화는 관리자 패널에서 열람할 수 없습니다." : "그룹/채널 채팅방 권한만 저장할 수 있습니다."}</p>
        </div>
        <button
          className="admin-primary full"
          type="button"
          onClick={() => onToast(isDirectRoom ? "개인 대화 열람은 차단되었습니다" : "채팅방 권한 설정을 저장했습니다")}
        >
          {isDirectRoom ? "개인 대화 열람 불가" : "저장"}
        </button>
      </aside>
    </section>
  );
}

function AuditView({
  requests,
  selectedRequest,
  onSelect,
  onApprove,
  onDeny
}: {
  requests: AuditRequest[];
  selectedRequest: AuditRequest;
  onSelect: (id: string) => void;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const isDirectRequest = selectedRequest.room.includes("1:1") || selectedRequest.room.includes("DM");
  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-toolbar">
          <label className="admin-search"><Search size={17} /><input placeholder="감사 로그 검색" /></label>
          <select defaultValue="전체"><option>전체</option><option>로그인</option><option>권한변경</option><option>채팅열람</option></select>
        </div>
        <div className="audit-list">
          {requests.map((request) => (
            <button key={request.id} className={selectedRequest.id === request.id ? "selected" : ""} type="button" onClick={() => onSelect(request.id)}>
              <span className={`audit-dot ${request.status}`}></span>
              <strong>{request.target} 열람 요청</strong>
              <small>{request.requester} · {request.createdAt} · {request.status}</small>
            </button>
          ))}
        </div>
        <div className="immutable-log">
          {auditLogs.map((log) => <div key={log}>{log}</div>)}
        </div>
      </div>
      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>요청 상세</h2>
          <span className="admin-badge">{selectedRequest.status}</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>요청자</dt><dd>{selectedRequest.requester}</dd></div>
          <div><dt>대상</dt><dd>{selectedRequest.target}</dd></div>
          <div><dt>채팅방</dt><dd>{selectedRequest.room}</dd></div>
          <div><dt>기간</dt><dd>{selectedRequest.period}</dd></div>
          <div><dt>사유</dt><dd>{selectedRequest.reason}</dd></div>
        </dl>
        <div className="chat-viewer-preview">
          <strong>{isDirectRequest ? "개인 대화 열람 차단" : "열람 뷰어"}</strong>
          <p>{isDirectRequest ? "1:1 개인 대화는 열람 승인 대상이 아닙니다." : "승인 후 복호화 메시지와 파일 목록이 표시됩니다."}</p>
        </div>
        <div className="admin-button-row">
          <button className="admin-primary" type="button" disabled={selectedRequest.status !== "대기" || isDirectRequest} onClick={onApprove}><Check size={16} /> 승인</button>
          <button className="admin-danger" type="button" disabled={selectedRequest.status !== "대기"} onClick={onDeny}>거부</button>
        </div>
      </aside>
    </section>
  );
}

function OffboardingView({
  cases,
  selectedCase,
  onSelect,
  onRevoke,
  onComplete,
  onCancelOffboarding
}: {
  cases: OffboardingCase[];
  selectedCase: OffboardingCase | null;
  onSelect: (id: string) => void;
  onRevoke: () => void;
  onComplete: () => void;
  onCancelOffboarding: (caseId: string) => void;
}) {
  if (!selectedCase) {
    return (
      <section className="admin-grid-view">
        <div className="admin-panel wide">
          <div className="empty-admin-state">퇴사자 목록이 비어 있습니다.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-grid-view">
      <div className="admin-panel wide">
        <div className="admin-table offboarding">
          <div className="admin-table-row header"><span>이름</span><span>부서</span><span>퇴사 예정일</span><span>상태</span><span>진행도</span></div>
          {cases.map((item) => (
            <button key={item.id} className={`admin-table-row ${selectedCase.id === item.id ? "selected" : ""}`} type="button" onClick={() => onSelect(item.id)}>
              <span>{item.name}</span><span>{item.department}</span><span>{item.plannedDate}</span><span>{item.state}</span><Progress value={item.progress} />
            </button>
          ))}
        </div>
      </div>
      <aside className="admin-panel detail">
        <div className="admin-panel-head">
          <h2>{selectedCase.name}</h2>
          <span className="admin-badge danger">{selectedCase.plannedDate}</span>
        </div>
        <div className="offboarding-checks">
          <CheckLine done label="인사 정보 정리" detail="최종 급여 및 인증서 준비" />
          <CheckLine done={selectedCase.tokensRevoked} label="계정 비활성화" detail={selectedCase.tokensRevoked ? "모든 세션 종료" : "현재 활성 세션 있음"} />
          <CheckLine done label="업무 이관" detail={selectedCase.tasks.join(", ")} />
          <CheckLine done={selectedCase.progress >= 100} label="채팅방 정리" detail="참여 채팅방 5개 자동 퇴장 예정" />
          <CheckLine done={selectedCase.tokensRevoked} label="보안 조치" detail="토큰 폐기 및 파일 접근 차단" />
        </div>
        <div className="admin-button-row">
          <button className="admin-secondary" type="button" onClick={onRevoke}>모든 토큰 폐기</button>
          <button className="admin-primary" type="button" onClick={onComplete}>퇴사 처리 완료</button>
          <button
            className="admin-danger"
            type="button"
            onClick={() => {
              const confirmation = window.prompt("퇴사자를 복귀하려면 '복귀'를 입력해 주세요.");
              if (confirmation === "복귀") {
                onCancelOffboarding(selectedCase.id);
              }
            }}
          >
            퇴사자 복귀
          </button>
        </div>
      </aside>
    </section>
  );
}

function SettingsView({ onToast }: { onToast: (message: string) => void }) {
  return (
    <section className="settings-grid">
      {[
        ["회사 정보", "회사명, 로고, 관리자 연락처"],
        ["로그인 보안", "실패 5회 잠금, 2FA 인증 정책"],
        ["메시지 보관", "보관 기간, 감사 로그 불변성"],
        ["백업", "매일 02:00 자동 백업 및 내보내기"]
      ].map(([title, body]) => (
        <article className="admin-panel setting-card" key={title}>
          <div className="admin-panel-head"><h2>{title}</h2><Settings size={18} /></div>
          <p>{body}</p>
          <button className="admin-secondary" type="button" onClick={() => onToast(`${title} 설정을 저장했습니다`)}>설정 저장</button>
        </article>
      ))}
    </section>
  );
}

function UserModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (form: HTMLFormElement) => void }) {
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form
        className="admin-modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event.currentTarget);
        }}
      >
        <div className="admin-panel-head">
          <h2>신규 사용자 추가</h2>
          <button className="admin-icon-button" type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>
        <label>이름<input name="name" required defaultValue="김영희" /></label>
        <label>이메일<input name="email" required type="email" defaultValue="kim.younghee@company.com" /></label>
        <label>부서<select name="department">{departmentNames.map((department) => <option key={department}>{department}</option>)}</select></label>
        <label>직급<select name="position">{positionNames.map((position) => <option key={position}>{position}</option>)}</select></label>
        <label>입사일<input name="joinedAt" required type="date" defaultValue="2026-05-22" /></label>
        <button className="admin-primary full" type="submit">저장</button>
      </form>
    </div>
  );
}

function TwoFactorModal({ onClose, onApprove }: { onClose: () => void; onApprove: () => void }) {
  const [code, setCode] = useState("123456");
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-modal">
        <div className="admin-panel-head">
          <h2>2FA 인증</h2>
          <button className="admin-icon-button" type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>
        <p className="admin-muted">Mock SMS 코드 123456을 입력하면 감사 요청이 승인됩니다.</p>
        <label>인증 코드<input value={code} onChange={(event) => setCode(event.target.value)} /></label>
        <button className="admin-primary full" type="button" disabled={code !== "123456"} onClick={onApprove}>확인</button>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Users; label: string; value: string; detail: string; tone: string }) {
  return (
    <article className={`admin-metric ${tone}`}>
      <Icon size={24} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function ActionRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="admin-action-row">
      <div><strong>{title}</strong><span>{meta}</span></div>
      <ChevronRight size={17} />
    </div>
  );
}

function ActionButton({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button className="admin-action-button" type="button" onClick={onClick}>
      <div><strong>{title}</strong><span>{meta}</span></div>
      <ChevronRight size={17} />
    </button>
  );
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  return <span className={`admin-status ${status.replace(" ", "-")}`}>{status}</span>;
}

function Progress({ value }: { value: number }) {
  return <span className="admin-progress" aria-label={`진행도 ${value}%`}><i style={{ width: `${value}%` }} /></span>;
}

function CheckLine({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div className="check-line">
      <span className={done ? "done" : ""}>{done ? <Check size={14} /> : ""}</span>
      <div><strong>{label}</strong><small>{detail}</small></div>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return <div className="admin-toast">{text}</div>;
}

const viewTitle: Record<AdminView, { eyebrow: string; title: string }> = {
  dashboard: { eyebrow: "Overview", title: "관리자 대시보드" },
  users: { eyebrow: "Identity", title: "사용자 관리" },
  organization: { eyebrow: "Organization", title: "조직 구조 관리" },
  positions: { eyebrow: "Roles", title: "직급 체계 관리" },
  access: { eyebrow: "Access Control", title: "권한 및 접근 제어" },
  audit: { eyebrow: "Audit", title: "감사 로그와 감시 요청" },
  offboarding: { eyebrow: "HR Operations", title: "퇴사자 처리" },
  settings: { eyebrow: "System", title: "시스템 설정" }
};
