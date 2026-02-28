export type ChatLocale = "ko" | "en";

const ko = {
  // chat-window
  chat: "채팅",

  // chat-room-list
  loading: "불러오는 중...",
  noConversations: "아직 대화가 없습니다.",
  noConversationsHint: "공유 문서를 열어 채팅을 시작하세요.",
  newMessage: "새 메시지",
  pages: "페이지",
  directMessages: "다이렉트 메시지",
  untitled: "제목 없음",
  deletedMessage: "삭제된 메시지",

  // chat-conversation
  pageChat: "페이지 채팅",
  directMessage: "다이렉트 메시지",
  loadingMessages: "메시지 불러오는 중...",
  noMessages: "아직 메시지가 없습니다. 대화를 시작해 보세요!",

  // chat-thread
  thread: "스레드",
  repliesLoading: "답글 불러오는 중...",
  noReplies: "아직 답글이 없습니다",
  threadReplyPlaceholder: "스레드에 답글 작성...",

  // chat-input
  inputPlaceholder: "메시지를 입력하세요...",
  attachFile: "파일 첨부",
  pressEnterToSendFile: "Enter를 눌러 파일 전송",

  // chat-message-item
  messageDeleted: "이 메시지는 삭제되었습니다",
  unknownUser: "알 수 없음",
  edited: "(수정됨)",
  save: "저장",
  cancel: "취소",
  attachment: "첨부파일",
  replyInThread: "스레드에 답글",
  edit: "수정",
  delete: "삭제",

  // chat-page-button
  pageChatTooltip: "페이지 채팅",

  // chat-user-picker
  searchPlaceholder: "이름 또는 이메일로 검색...",
  searching: "검색 중...",
  noUsersFound: "사용자를 찾을 수 없습니다",

  // chat-utils
  justNow: "방금",

  // dynamic
  repliesCount: (n: number) => `답글 ${n}개`,

  // settings-modal
  mySettings: "내 설정",
  appearance: "외관",
  appearanceDesc: "기기에서 Mentis의 외관을 변경합니다.",
  language: "언어",
  languageDesc: "표시 언어를 변경합니다.",

  // user-item
  personalPlan: (n: number) => `개인 요금제 - ${n}명의 멤버`,
  settings: "설정",
  members: "멤버",
  addAnotherAccount: "다른 계정 추가",
  logOutAll: "모든 계정에서 로그아웃",

  // members-modal
  roleOwner: "소유자",
  roleAdmin: "관리자",
  roleMember: "멤버",
  membersTitle: "멤버",
  membersCount: (n: number) => `${n}명`,
  inviteMembers: "멤버 초대",
  searchByNameOrEmail: "이름 또는 이메일로 검색...",
  activeOnly: "활성만",
  includeInactive: "비활성 포함",
  createInviteLink: "초대 링크 생성",
  close: "닫기",
  creating: "생성 중...",
  createLink: "링크 생성",
  copied: "복사됨",
  copy: "복사",
  userColumn: "사용자",
  roleColumn: "역할",
  noSearchResults: "검색 결과가 없습니다.",
  noMembers: "멤버가 없습니다.",
  unnamed: "이름 없음",
  selfLabel: "(나)",
  inactive: "비활성",
  deactivate: "비활성화",
  activate: "활성화",
  deactivateMember: "멤버 비활성화",
  activateMember: "멤버 활성화",
  deactivateConfirm: (name: string) => `${name}님을 비활성화하시겠습니까? 비활성화된 멤버는 로그인할 수 없습니다.`,
  activateConfirm: (name: string) => `${name}님을 다시 활성화하시겠습니까?`,

  // user-item
  defaultUserName: "사용자",
  workspaceName: (name: string) => `${name}의 Mentis`,

  // typing indicator
  typingIndicator: (names: string) => `${names} 입력 중...`,

  // collaborators
  timeJustNow: "방금 전",
  timeMinutesAgo: (n: number) => `${n}분 전`,
  timeHoursAgo: (n: number) => `${n}시간 전`,
  timeDaysAgo: (n: number) => `${n}일 전`,
  statusOnline: "온라인",
  statusAway: "자리 비움",
  statusOffline: "오프라인",
  editingNow: "편집 중",
  activeEditors: (n: number) => `${n}명이 편집 중`,
  viewAllCollaborators: "모든 협업자 보기",
  jumpToUser: "커서 위치로 이동",

  // sync-status
  syncSaved: "저장됨",
  syncSaving: "저장 중...",
  syncOffline: "오프라인",
  syncSyncing: "동기화 중...",

  // activity-log
  activityLog: "활동 로그",
  activityJoined: "문서에 참여했습니다",
  activityLeft: "문서를 떠났습니다",
  activityStartedEditing: "편집을 시작했습니다",
  activityStoppedEditing: "편집을 멈췄습니다",
  noActivity: "아직 활동이 없습니다",
  activityToday: "오늘",
  activityYesterday: "어제",
  activityEarlier: "이전",

  // focus mode
  focusModeOn: "집중 모드 켜기",
  focusModeOff: "집중 모드 끄기",
  focusModeActive: "집중 모드 활성 — 협업 UI가 숨겨져 있습니다",

  // version-history
  versionHistory: "버전 히스토리",
  noVersions: "아직 버전이 없습니다",
  restore: "복원",
  versionSaved: "자동 저장됨",
} as const;

type ChatDict = { [K in keyof typeof ko]: (typeof ko)[K] extends (...args: infer A) => string ? (...args: A) => string : string };

const en: ChatDict = {
  // chat-window
  chat: "Chat",

  // chat-room-list
  loading: "Loading...",
  noConversations: "No conversations yet.",
  noConversationsHint: "Open a shared document to start chatting.",
  newMessage: "New message",
  pages: "Pages",
  directMessages: "Direct messages",
  untitled: "Untitled",
  deletedMessage: "Deleted message",

  // chat-conversation
  pageChat: "Page chat",
  directMessage: "Direct message",
  loadingMessages: "Loading messages...",
  noMessages: "No messages yet. Start a conversation!",

  // chat-thread
  thread: "Thread",
  repliesLoading: "Loading replies...",
  noReplies: "No replies yet",
  threadReplyPlaceholder: "Reply in thread...",

  // chat-input
  inputPlaceholder: "Type a message...",
  attachFile: "Attach file",
  pressEnterToSendFile: "Press Enter to send file",

  // chat-message-item
  messageDeleted: "This message was deleted",
  unknownUser: "Unknown",
  edited: "(edited)",
  save: "Save",
  cancel: "Cancel",
  attachment: "Attachment",
  replyInThread: "Reply in thread",
  edit: "Edit",
  delete: "Delete",

  // chat-page-button
  pageChatTooltip: "Page chat",

  // chat-user-picker
  searchPlaceholder: "Search by name or email...",
  searching: "Searching...",
  noUsersFound: "No users found",

  // chat-utils
  justNow: "just now",

  // dynamic
  repliesCount: (n: number) => `${n} ${n === 1 ? "reply" : "replies"}`,

  // settings-modal
  mySettings: "My settings",
  appearance: "Appearance",
  appearanceDesc: "Customize how Mentis looks on your device.",
  language: "Language",
  languageDesc: "Change the display language.",

  // user-item
  personalPlan: (n: number) => `Personal plan - ${n} ${n === 1 ? "member" : "members"}`,
  settings: "Settings",
  members: "Members",
  addAnotherAccount: "Add another account",
  logOutAll: "Log out of all accounts",

  // members-modal
  roleOwner: "Owner",
  roleAdmin: "Admin",
  roleMember: "Member",
  membersTitle: "Members",
  membersCount: (n: number) => `${n}`,
  inviteMembers: "Invite members",
  searchByNameOrEmail: "Search by name or email...",
  activeOnly: "Active only",
  includeInactive: "Include inactive",
  createInviteLink: "Create invite link",
  close: "Close",
  creating: "Creating...",
  createLink: "Create link",
  copied: "Copied",
  copy: "Copy",
  userColumn: "User",
  roleColumn: "Role",
  noSearchResults: "No search results.",
  noMembers: "No members.",
  unnamed: "Unnamed",
  selfLabel: "(you)",
  inactive: "Inactive",
  deactivate: "Deactivate",
  activate: "Activate",
  deactivateMember: "Deactivate member",
  activateMember: "Activate member",
  deactivateConfirm: (name: string) => `Are you sure you want to deactivate ${name}? Deactivated members cannot sign in.`,
  activateConfirm: (name: string) => `Are you sure you want to reactivate ${name}?`,

  // user-item
  defaultUserName: "User",
  workspaceName: (name: string) => `${name}'s Mentis`,

  // typing indicator
  typingIndicator: (names: string) => `${names} typing...`,

  // collaborators
  timeJustNow: "just now",
  timeMinutesAgo: (n: number) => `${n}m ago`,
  timeHoursAgo: (n: number) => `${n}h ago`,
  timeDaysAgo: (n: number) => `${n}d ago`,
  statusOnline: "Online",
  statusAway: "Away",
  statusOffline: "Offline",
  editingNow: "Editing",
  activeEditors: (n: number) => `${n} ${n === 1 ? "person" : "people"} editing`,
  viewAllCollaborators: "View all collaborators",
  jumpToUser: "Jump to cursor",

  // sync-status
  syncSaved: "Saved",
  syncSaving: "Saving...",
  syncOffline: "Offline",
  syncSyncing: "Syncing...",

  // activity-log
  activityLog: "Activity log",
  activityJoined: "joined the document",
  activityLeft: "left the document",
  activityStartedEditing: "started editing",
  activityStoppedEditing: "stopped editing",
  noActivity: "No activity yet",
  activityToday: "Today",
  activityYesterday: "Yesterday",
  activityEarlier: "Earlier",

  // focus mode
  focusModeOn: "Focus mode on",
  focusModeOff: "Focus mode off",
  focusModeActive: "Focus mode active — collaboration UI is hidden",

  // version-history
  versionHistory: "Version history",
  noVersions: "No versions yet",
  restore: "Restore",
  versionSaved: "Auto-saved",
};

const dictionaries = { ko, en } as const;

export type ChatTranslations = ChatDict;

export function getChatT(locale: ChatLocale): ChatTranslations {
  return dictionaries[locale];
}
