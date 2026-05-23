import { CalendarDays, CheckCircle2, ClipboardList, MessageSquare, PanelRightOpen, Play, Search, Shield, UserPlus, X } from "lucide-react";

export type DemoStepId = "login" | "room" | "task" | "search" | "guest" | "calendar" | "audit";

const steps: Array<{ id: DemoStepId; label: string; detail: string; icon: typeof Play }> = [
  { id: "login", label: "Login", detail: "내부 사용자 Mock JWT 세션 확인", icon: CheckCircle2 },
  { id: "room", label: "Room", detail: "캠페인 채팅방으로 이동", icon: MessageSquare },
  { id: "task", label: "Message -> Task", detail: "메시지 원문에서 작업 생성 모달 열기", icon: ClipboardList },
  { id: "search", label: "Search Split-View", detail: "통합 검색 결과를 오른쪽 맥락 패널로 열기", icon: Search },
  { id: "guest", label: "Guest Invite", detail: "외부 협업 매직링크/OTP 흐름 표시", icon: UserPlus },
  { id: "calendar", label: "Calendar Sync", detail: "Google Calendar 동기화 Mock 실행", icon: CalendarDays },
  { id: "audit", label: "Audit Panel", detail: "보안/감사 패널로 이동", icon: Shield }
];

export function DemoGuidePanel({
  open,
  currentStep,
  onToggle,
  onRunStep
}: {
  open: boolean;
  currentStep: DemoStepId;
  onToggle: () => void;
  onRunStep: (step: DemoStepId) => void;
}) {
  if (!open) {
    return (
      <button className="demo-guide-trigger" onClick={onToggle} title="데모 가이드 열기">
        <PanelRightOpen size={18} aria-hidden />
        데모
      </button>
    );
  }

  return (
    <aside className="demo-guide-panel" aria-label="발표자 데모 가이드">
      <div className="demo-guide-head">
        <div>
          <span className="eyebrow">Presenter Path</span>
          <h2>결정형 데모 스크립트</h2>
        </div>
        <button className="icon-button" onClick={onToggle} title="데모 가이드 닫기">
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="demo-step-list">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = currentStep === step.id;
          return (
            <button key={step.id} className={active ? "active" : ""} onClick={() => onRunStep(step.id)}>
              <Icon size={17} aria-hidden />
              <span>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="demo-state-grid" aria-label="화면 상태 체크">
        <span>Empty</span>
        <span>Loading</span>
        <span>Error</span>
      </div>
    </aside>
  );
}
