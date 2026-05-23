import { Bell, CalendarDays, ClipboardList, MessageSquare, Search, Shield, UserPlus, Users } from "lucide-react";
import { Metric } from "../common/Metric";
import { QuickCard } from "../common/QuickCard";

export function HomeDashboard({
  taskCount,
  searchResultCount,
  onOpenRoom,
  onInvite,
  onCalendar,
  onOrg
}: {
  taskCount: number;
  searchResultCount: number;
  onOpenRoom: () => void;
  onInvite: () => void;
  onCalendar: () => void;
  onOrg: () => void;
}) {
  return (
    <div className="home">
      <section className="summary-band">
        <div>
          <span className="eyebrow">오늘의 업무 허브</span>
          <h1>채팅 맥락을 유지한 채 작업, 검색, 초대를 처리합니다</h1>
        </div>
        <button className="primary-action" onClick={onOpenRoom}>
          <MessageSquare size={18} aria-hidden />
          가장 최근 채팅 열기
        </button>
      </section>

      <div className="metric-grid">
        <Metric label="활성 채팅방" value="4" icon={MessageSquare} tone="blue" />
        <Metric label="진행 작업" value={String(taskCount)} icon={ClipboardList} tone="green" />
        <Metric label="검색 후보" value={String(searchResultCount)} icon={Search} tone="amber" />
        <Metric label="게스트 권한" value="72h" icon={Shield} tone="red" />
      </div>

      <section className="quick-grid" aria-label="빠른 접근">
        <QuickCard icon={MessageSquare} title="채팅" text="메시지 우클릭으로 Task를 바로 생성" onClick={onOpenRoom} />
        <QuickCard icon={CalendarDays} title="캘린더" text="Task를 일정으로 변환하고 Google Calendar Mock 동기화" onClick={onCalendar} />
        <QuickCard icon={UserPlus} title="게스트 초대" text="설치와 가입 없이 매직링크로 외부 협업" onClick={onInvite} />
        <QuickCard icon={Users} title="조직도" text="부서별 멤버를 확인하고 채팅방 생성 흐름으로 연결" onClick={onOrg} />
      </section>

      <section className="notice-strip">
        <Bell size={18} aria-hidden />
        <span>박지영에게 할당된 크리에이티브 작업 마감이 2일 남았습니다.</span>
      </section>
    </div>
  );
}
