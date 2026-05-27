import type { CalendarEvent, Message, Room, Task, User } from "../types";

export const users: User[] = [
  {
    id: "USER-001",
    email: "lee.minsu@agency.com",
    phone: "010-1234-5678",
    name: "이민수",
    department: "기획팀",
    position: "팀장",
    avatar: "LM",
    status: "online",
    role: "TEAM_LEAD",
    part: "기획 총괄 및 광고 캠페인 PM"
  },
  {
    id: "USER-002",
    email: "park.jihun@agency.com",
    phone: "010-2345-6789",
    name: "박지훈",
    department: "개발팀",
    position: "신입",
    avatar: "PJ",
    status: "online",
    role: "EMPLOYEE",
    part: "프론트엔드 UI/UX 구현"
  },
  {
    id: "USER-003",
    email: "park.jiyoung@agency.com",
    phone: "010-3456-7890",
    name: "박지영",
    department: "디자인팀",
    position: "주임",
    avatar: "PJY",
    status: "online",
    role: "EMPLOYEE",
    part: "브랜드 키 비주얼 디자인"
  },
  {
    id: "USER-004",
    email: "kang.minhyuk@agency.com",
    phone: "010-4567-8901",
    name: "강민혁",
    department: "개발팀",
    position: "팀장",
    avatar: "KM",
    status: "away",
    role: "TEAM_LEAD",
    part: "서버 백엔드 및 인프라 설계"
  },
  {
    id: "USER-005",
    email: "kim.insa@agency.com",
    phone: "010-1111-2222",
    name: "김인사",
    department: "인사팀",
    position: "과장",
    avatar: "KI",
    status: "online",
    role: "TEAM_LEAD",
    part: "인사 및 총무 총괄"
  },
  {
    id: "USER-006",
    email: "lee.chaeyong@agency.com",
    phone: "010-2222-3333",
    name: "이채용",
    department: "인사팀",
    position: "대리",
    avatar: "LCY",
    status: "away",
    role: "EMPLOYEE",
    part: "인재 채용 및 평가"
  },
  {
    id: "USER-007",
    email: "choi.mkt@agency.com",
    phone: "010-3333-4444",
    name: "최마케",
    department: "마케팅팀",
    position: "대리",
    avatar: "CMK",
    status: "online",
    role: "EMPLOYEE",
    part: "퍼포먼스 마케팅 및 검색 최적화"
  },
  {
    id: "USER-008",
    email: "jung.pr@agency.com",
    phone: "010-4444-5555",
    name: "정홍보",
    department: "마케팅팀",
    position: "사원",
    avatar: "JHB",
    status: "online",
    role: "EMPLOYEE",
    part: "브랜드 PR 및 언론 홍보 보도자료 배포"
  },
  {
    id: "GUEST-001",
    email: "client@brandagency.com",
    phone: "010-5678-9012",
    name: "이클라이언트",
    department: "외부",
    position: "게스트",
    avatar: "LC",
    status: "online",
    role: "GUEST",
    accessibleRoomIds: ["ROOM-003"],
    expiresAt: "2026-05-24T10:00:00Z",
    part: "클라이언트 피드백 검토 및 요구사항 전달"
  },
  {
    id: "GUEST-002",
    email: "partner@marketing.com",
    phone: "010-9876-5432",
    name: "김파트너",
    department: "외부",
    position: "대행사",
    avatar: "KP",
    status: "offline",
    role: "GUEST",
    accessibleRoomIds: ["ROOM-003"],
    expiresAt: "2026-05-20T10:00:00Z",
    part: "외부 대행 마케팅 지원"
  },
  {
    id: "GUEST-003",
    email: "support@freelancer.com",
    phone: "010-8765-4321",
    name: "최서포터",
    department: "외부",
    position: "프리랜서",
    avatar: "CS",
    status: "offline",
    role: "GUEST",
    accessibleRoomIds: [],
    expiresAt: "2026-05-15T12:00:00Z",
    part: "외주 그래픽 소스 디자인 지원"
  }
];

export const rooms: Room[] = [
  {
    id: "ROOM-001",
    name: "일일 스탠드업",
    type: "CHANNEL_PRIVATE",
    description: "개발팀 일일 스탠드업 미팅",
    participants: ["USER-001", "USER-002", "USER-004"],
    createdAt: "2026-05-01T09:00:00Z",
    unreadCount: 0
  },
  {
    id: "ROOM-002",
    name: "3월 신규 캠페인 프로젝트",
    type: "GROUP_PRIVATE",
    description: "3월 신규 캠페인 기획 및 진행",
    participants: ["USER-001", "USER-003", "USER-004"],
    createdAt: "2026-04-15T14:30:00Z",
    unreadCount: 2
  },
  {
    id: "ROOM-003",
    name: "프로젝트 A 협업",
    type: "GROUP_PRIVATE",
    description: "외부 클라이언트와의 협업 채팅",
    participants: ["USER-001", "USER-003", "GUEST-001"],
    createdAt: "2026-05-10T10:15:00Z",
    unreadCount: 0
  },
  {
    id: "ROOM-004",
    name: "1:1 박지훈",
    type: "DIRECT",
    description: "신입 온보딩과 업무 피드백",
    participants: ["USER-001", "USER-002"],
    createdAt: "2026-05-15T16:45:00Z",
    unreadCount: 1
  }
];

export const messages: Record<string, Message[]> = {
  "ROOM-002": [
    {
      id: "MSG-001",
      roomId: "ROOM-002",
      senderId: "USER-004",
      content: "3월 캠페인 크리에이티브 기획 회의 시작합니다",
      timestamp: "2026-05-20T10:00:00Z",
      readBy: ["USER-001", "USER-003", "USER-004"],
      unreadCount: 0
    },
    {
      id: "MSG-002",
      roomId: "ROOM-002",
      senderId: "USER-001",
      content: "이번주 유튜브 광고 크리에이티브 3개 완성해야함",
      timestamp: "2026-05-20T10:15:00Z",
      readBy: ["USER-003", "USER-004"],
      unreadCount: 1,
      linkedTaskId: "TASK-001"
    },
    {
      id: "MSG-003",
      roomId: "ROOM-002",
      senderId: "USER-003",
      content: "알겠습니다. 일단 스타일 가이드부터 정리하겠습니다",
      timestamp: "2026-05-20T10:20:00Z",
      readBy: ["USER-001", "USER-004"],
      unreadCount: 1
    }
  ],
  "ROOM-001": [
    {
      id: "MSG-004",
      roomId: "ROOM-001",
      senderId: "USER-002",
      content: "REST API 설계 회의 내용 공유합니다",
      timestamp: "2026-05-20T14:30:00Z",
      readBy: ["USER-001", "USER-004"],
      unreadCount: 1
    },
    {
      id: "MSG-005",
      roomId: "ROOM-001",
      senderId: "USER-004",
      content: "REST API 컨벤션 정의했습니다. 이제 구현 시작하겠습니다",
      timestamp: "2026-05-20T14:45:00Z",
      readBy: ["USER-001", "USER-002"],
      unreadCount: 1
    },
    {
      id: "MSG-006",
      roomId: "ROOM-001",
      senderId: "USER-001",
      content: "API 버전 관리는 semantic versioning을 기준으로 정리해 주세요",
      timestamp: "2026-05-20T15:00:00Z",
      readBy: ["USER-002", "USER-004"],
      unreadCount: 0
    }
  ],
  "ROOM-003": [
    {
      id: "MSG-007",
      roomId: "ROOM-003",
      senderId: "GUEST-001",
      content: "랜딩 페이지 톤은 조금 더 신뢰감 있게 가져가면 좋겠습니다",
      timestamp: "2026-05-21T09:20:00Z",
      readBy: ["USER-001"],
      unreadCount: 1
    }
  ],
  "ROOM-004": [
    {
      id: "MSG-008",
      roomId: "ROOM-004",
      senderId: "USER-002",
      content: "오늘 REST API 설계 문서 리뷰 부탁드립니다",
      timestamp: "2026-05-21T08:55:00Z",
      readBy: ["USER-001"],
      unreadCount: 0
    }
  ]
};

export const tasks: Task[] = [
  {
    id: "TASK-001",
    sourceMessageId: "MSG-002",
    sourceRoomId: "ROOM-002",
    title: "유튜브 광고 크리에이티브 3개 완성",
    description: "유튜브 15초 버전 필수",
    assigneeId: "USER-001",
    assigneeIds: ["USER-001", "USER-003"],
    createdBy: "USER-001",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-05-23T23:59:59Z",
    createdAt: "2026-05-20T10:15:00Z",
    updatedAt: "2026-05-20T14:20:00Z"
  },
  {
    id: "TASK-002",
    title: "SNS 콘텐츠 기획",
    sourceRoomId: "ROOM-002",
    assigneeId: "USER-001",
    assigneeIds: ["USER-001"],
    createdBy: "USER-001",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: "2026-05-25T23:59:59Z",
    createdAt: "2026-05-18T11:30:00Z"
  },
  {
    id: "TASK-003",
    title: "클라이언트 피드백 수집",
    sourceRoomId: "ROOM-003",
    assigneeId: "USER-004",
    assigneeIds: ["USER-004"],
    createdBy: "USER-001",
    status: "PENDING",
    priority: "LOW",
    dueDate: "2026-05-30T23:59:59Z",
    createdAt: "2026-05-15T09:00:00Z"
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "EVT-001",
    title: "팀 스프린트 계획 회의",
    startsAt: "2026-05-24T10:00:00",
    endsAt: "2026-05-24T11:00:00",
    attendees: ["USER-001", "USER-002", "USER-004"],
    googleEventId: "gcal_mock_20260524_1000",
    description: "스프린트 목표와 API 설계 후속 작업을 정리합니다."
  },
  {
    id: "EVT-002",
    title: "유튜브 광고 소재 1차 리뷰",
    startsAt: "2026-05-23T14:00:00",
    endsAt: "2026-05-23T15:00:00",
    attendees: ["USER-001", "USER-003"],
    linkedTaskId: "TASK-001",
    googleEventId: "gcal_mock_20260523_1400",
    description: "TASK-001 산출물 초안을 확인하고 15초 버전 수정 범위를 확정합니다."
  },
  {
    id: "EVT-003",
    title: "SNS 콘텐츠 기획안 공유",
    startsAt: "2026-05-25T09:30:00",
    endsAt: "2026-05-25T10:30:00",
    attendees: ["USER-001", "USER-002"],
    linkedTaskId: "TASK-002",
    googleEventId: "gcal_mock_20260525_0930",
    description: "채널별 콘텐츠 방향과 게시 일정을 점검합니다."
  },
  {
    id: "EVT-004",
    title: "클라이언트 피드백 정리",
    startsAt: "2026-05-30T16:00:00",
    endsAt: "2026-05-30T17:00:00",
    attendees: ["USER-001", "USER-004"],
    linkedTaskId: "TASK-003",
    googleEventId: "gcal_mock_20260530_1600",
    description: "외부 피드백을 우선순위별로 분류하고 후속 액션을 정리합니다."
  },
  {
    id: "EVT-005",
    title: "REST API 설계 리뷰",
    startsAt: "2026-05-21T11:00:00",
    endsAt: "2026-05-21T12:00:00",
    attendees: ["USER-001", "USER-002"],
    googleEventId: "gcal_mock_20260521_1100",
    description: "검색 결과 Split-View와 메시지 기반 Task 생성 API 흐름을 검토합니다."
  },
  {
    id: "EVT-006",
    title: "게스트 초대 플로우 점검",
    startsAt: "2026-05-22T15:00:00",
    endsAt: "2026-05-22T15:40:00",
    attendees: ["USER-001", "GUEST-001"],
    googleEventId: "gcal_mock_20260522_1500",
    description: "게스트 접근 권한, 만료 시간, 외부 채널 표시 정책을 확인합니다."
  }
];
