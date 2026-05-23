import { Building2, ChevronDown, ChevronRight, Search, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { users as staticUsers } from "../../data/mockData";
import type { User } from "../../types";

export function OrgChart({
  compact = false,
  onPersonClick,
  users: propUsers
}: {
  compact?: boolean;
  onPersonClick?: (user: User) => void;
  users?: User[];
}) {
  const users = propUsers || staticUsers;
  const [searchText, setSearchText] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const guests = useMemo(() => users.filter((u) => u.role === "GUEST"), []);
  
  const currentTime = useMemo(() => new Date("2026-05-23T11:00:00Z").getTime(), []);
  
  const { externalActive, externalPast } = useMemo(() => {
    const active: User[] = [];
    const past: User[] = [];
    guests.forEach((g) => {
      if (g.expiresAt && new Date(g.expiresAt).getTime() > currentTime) {
        active.push(g);
      } else {
        past.push(g);
      }
    });
    return { externalActive: active, externalPast: past };
  }, [guests, currentTime]);

  const toggleExternalCollapse = (branch: "active" | "past") => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      const key = `ext-${branch}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const groups = useMemo(() => {
    const map: Record<string, User[]> = {};
    users
      .filter((u) => u.role !== "GUEST")
      .forEach((user) => {
        if (!map[user.department]) map[user.department] = [];
        map[user.department].push(user);
      });
    Object.values(map).forEach((members) => {
      members.sort((a, b) => {
        if (a.role === "TEAM_LEAD" && b.role !== "TEAM_LEAD") return -1;
        if (a.role !== "TEAM_LEAD" && b.role === "TEAM_LEAD") return 1;
        return 0;
      });
    });
    return map;
  }, []);

  const query = searchText.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!query) return groups;
    const result: Record<string, User[]> = {};
    Object.entries(groups).forEach(([dept, members]) => {
      const matched = members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.position.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          (m.phone && m.phone.toLowerCase().includes(query))
      );
      if (matched.length > 0 || dept.toLowerCase().includes(query)) {
        result[dept] = matched.length > 0 ? matched : members;
      }
    });
    return result;
  }, [groups, query]);

  const flatMatchedUsers = useMemo(() => {
    if (!query) return [];
    return users.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.department.toLowerCase().includes(query) ||
        m.position.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.phone && m.phone.toLowerCase().includes(query))
    );
  }, [query]);

  const toggleCollapse = (dept: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const totalCount = users.filter((u) => u.role !== "GUEST").length;

  return (
    <section className={compact ? "org compact" : "org"}>
      {!compact && (
        <div className="content-head">
          <div>
            <span className="eyebrow">조직도</span>
            <h1>부서별 협업 멤버</h1>
          </div>
        </div>
      )}

      {!compact && (
        <div className="org-search-container" style={{ position: "relative", zIndex: 10 }}>
          <div className="org-search">
            <label className="org-search-field">
              <Search size={16} aria-hidden />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="이름, 부서, 직급, 이메일, 전화번호 검색"
              />
            </label>
            {query && (
              <span className="result-count">
                {flatMatchedUsers.length}명 검색됨
              </span>
            )}
          </div>

          {query && flatMatchedUsers.length > 0 && (
            <div className="org-search-results">
              {flatMatchedUsers.map((user) => (
                <div
                  key={user.id}
                  className="org-search-result-row"
                  onClick={() => {
                    // Expand department and user in tree list
                    setCollapsed((prev) => {
                      const next = new Set(prev);
                      next.delete(user.department);
                      if (user.role === "GUEST") {
                        const isExpired = user.expiresAt && new Date(user.expiresAt).getTime() < currentTime;
                        next.delete(isExpired ? "ext-past" : "ext-active");
                      }
                      return next;
                    });
                    setExpandedUsers((prev) => {
                      const next = new Set(prev);
                      next.add(user.id);
                      return next;
                    });
                  }}
                >
                  <span className="avatar">{user.avatar}</span>
                  <div className="result-info">
                    <div className="result-primary">
                      <strong>{highlight(user.name)}</strong>
                      <span>{highlight(user.position)} ({highlight(user.department)})</span>
                    </div>
                    <div className="result-details">
                      <span>{highlight(user.email)}</span>
                      {user.phone && <span> · {highlight(user.phone)}</span>}
                    </div>
                  </div>
                  {onPersonClick && (
                    <button
                      className="icon-button subtle chat-btn"
                      title="채팅 시작"
                      onClick={(e) => {
                        e.stopPropagation();
                        const isExpired = user.role === "GUEST" && user.expiresAt && new Date(user.expiresAt).getTime() < currentTime;
                        if (isExpired) {
                          alert("협업 기간이 만료된 과거 참여자와는 새 채팅방을 생성할 수 없습니다.");
                        } else {
                          onPersonClick(user);
                        }
                      }}
                      style={{
                        flexShrink: 0,
                        padding: 4,
                        cursor: (user.role === "GUEST" && user.expiresAt && new Date(user.expiresAt).getTime() < currentTime) ? "not-allowed" : "pointer",
                        opacity: (user.role === "GUEST" && user.expiresAt && new Date(user.expiresAt).getTime() < currentTime) ? 0.5 : 1
                      }}
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                  <span className={`status-dot ${user.status}`} style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="org-tree">
        <div className="tree-root">
          <div className="tree-node-content tree-node-root">
            <Building2 size={18} aria-hidden />
            <strong>조직</strong>
            <span className="tree-count">{totalCount}명</span>
          </div>
          <div className="tree-children">
            {Object.entries(filteredGroups).map(([dept, members], di, arr) => {
              const isOpen = !collapsed.has(dept);
              const isLastDept = di === arr.length - 1;
              return (
                <div key={dept} className={`tree-branch${isLastDept ? " tree-branch-last" : ""}`}>
                  <button
                    className="tree-node-content tree-node-dept"
                    onClick={() => toggleCollapse(dept)}
                  >
                    {isOpen ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                    <strong>{dept}</strong>
                    <span className="tree-count">{members.length}명</span>
                  </button>
                  {isOpen && (
                    <div className="tree-children">
                      {members.map((member, mi) => {
                        const isLastMember = mi === members.length - 1;
                        const isExpanded = expandedUsers.has(member.id);
                        return (
                          <div
                            key={member.id}
                            className={`tree-branch${isLastMember ? " tree-branch-last" : ""}`}
                          >
                            <div
                              className="tree-node-content tree-node-person"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                toggleUserExpand(member.id);
                              }}
                            >
                              <span className="avatar">{member.avatar}</span>
                              <div className="tree-person-info">
                                <strong>{member.name}</strong>
                                <span>
                                  {member.position}
                                  {member.role === "TEAM_LEAD" && " ★"}
                                </span>
                                {isExpanded && (
                                  <div className="tree-person-details" onClick={(e) => e.stopPropagation()}>
                                    <span className="email">{member.email}</span>
                                    {member.phone && <span className="phone">{member.phone}</span>}
                                  </div>
                                )}
                              </div>
                              {onPersonClick && (
                                <button
                                  className="icon-button subtle chat-btn"
                                  title="채팅 시작"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPersonClick(member);
                                  }}
                                  style={{ flexShrink: 0, padding: 4 }}
                                >
                                  <MessageSquare size={16} />
                                </button>
                              )}
                              <span className={`status-dot ${member.status}`} style={{ flexShrink: 0 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 외부 참여자 */}
        <div className="tree-root" style={{ marginTop: 24 }}>
          <div className="tree-node-content tree-node-root" style={{ background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))" }}>
            <Building2 size={18} aria-hidden />
            <strong>외부 참여자</strong>
            <span className="tree-count">{externalActive.length + externalPast.length}명</span>
          </div>
          <div className="tree-children">
            {/* 활성화 */}
            <div className="tree-branch">
              <button
                className="tree-node-content tree-node-dept"
                onClick={() => toggleExternalCollapse("active")}
              >
                {!collapsed.has("ext-active") ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                <strong>활성화</strong>
                <span className="tree-count">{externalActive.length}명</span>
              </button>
              {!collapsed.has("ext-active") && (
                <div className="tree-children">
                  {externalActive.map((member, mi) => {
                    const isLastMember = mi === externalActive.length - 1;
                    const isExpanded = expandedUsers.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`tree-branch${isLastMember ? " tree-branch-last" : ""}`}
                      >
                        <div
                          className="tree-node-content tree-node-person"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            toggleUserExpand(member.id);
                          }}
                        >
                          <span className="avatar" style={{ background: "var(--accent-gradient)" }}>{member.avatar}</span>
                          <div className="tree-person-info">
                            <strong>{member.name}</strong>
                            <span>{member.position}</span>
                            {isExpanded && (
                              <div className="tree-person-details" onClick={(e) => e.stopPropagation()}>
                                <span className="email">{member.email}</span>
                                {member.phone && <span className="phone">{member.phone}</span>}
                                {member.expiresAt && <span className="expiry" style={{ color: "var(--warning)", fontWeight: 700 }}>만료: {new Date(member.expiresAt).toLocaleDateString()}</span>}
                              </div>
                            )}
                          </div>
                          {onPersonClick && (
                            <button
                              className="icon-button subtle chat-btn"
                              title="채팅 시작"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPersonClick(member);
                              }}
                              style={{ flexShrink: 0, padding: 4 }}
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                          <span className={`status-dot ${member.status}`} style={{ flexShrink: 0 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 과거 협업 */}
            <div className="tree-branch tree-branch-last">
              <button
                className="tree-node-content tree-node-dept"
                onClick={() => toggleExternalCollapse("past")}
              >
                {!collapsed.has("ext-past") ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                <strong>과거 협업</strong>
                <span className="tree-count">{externalPast.length}명</span>
              </button>
              <div style={{ fontSize: 11, color: "var(--text-muted)", paddingLeft: 24, marginTop: 4, marginBottom: 8 }}>
                * 과거 협업 이력은 만료 후 최대 1년까지만 보존됩니다.
              </div>
              {!collapsed.has("ext-past") && (
                <div className="tree-children">
                  {externalPast.map((member, mi) => {
                    const isLastMember = mi === externalPast.length - 1;
                    const isExpanded = expandedUsers.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`tree-branch${isLastMember ? " tree-branch-last" : ""}`}
                      >
                        <div
                          className="tree-node-content tree-node-person"
                          style={{ cursor: "pointer", opacity: 0.65 }}
                          onClick={() => {
                            toggleUserExpand(member.id);
                          }}
                        >
                          <span className="avatar" style={{ background: "var(--text-muted)" }}>{member.avatar}</span>
                          <div className="tree-person-info">
                            <strong>{member.name}</strong>
                            <span>{member.position}</span>
                            {isExpanded && (
                              <div className="tree-person-details" onClick={(e) => e.stopPropagation()}>
                                <span className="email">{member.email}</span>
                                {member.phone && <span className="phone">{member.phone}</span>}
                                {member.expiresAt && <span className="expiry">만료됨: {new Date(member.expiresAt).toLocaleDateString()}</span>}
                              </div>
                            )}
                          </div>
                          {onPersonClick && (
                            <button
                              className="icon-button subtle chat-btn"
                              title="채팅 시작"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("협업 기간이 만료된 과거 참여자와는 새 채팅방을 생성할 수 없습니다.");
                              }}
                              style={{ flexShrink: 0, padding: 4, cursor: "not-allowed", opacity: 0.5 }}
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                          <span className={`status-dot ${member.status}`} style={{ flexShrink: 0 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {query && Object.keys(filteredGroups).length === 0 && (
        <div className="inline-state compact">
          <strong>검색 결과가 없습니다</strong>
          <span>다른 키워드로 검색해 보세요.</span>
        </div>
      )}
    </section>
  );
}
