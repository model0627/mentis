<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# chat

## Purpose
실시간 채팅 시스템 UI 컴포넌트. 페이지 채팅, DM, 쓰레드, 리액션, 파일 첨부를 지원하는 플로팅 위젯.

## Key Files

| File | Description |
|------|-------------|
| `chat-widget.tsx` | 최상위 컨테이너 - ChatButton + ChatWindow 렌더링 |
| `chat-button.tsx` | 플로팅 채팅 버튼 - 안읽은 메시지 카운트 뱃지 |
| `chat-window.tsx` | 채팅 윈도우 - 탭 관리 (룸 목록/대화/쓰레드), 유저피커 모달 |
| `chat-room-list.tsx` | 채팅 룸 목록 - 페이지/DM 분리, 안읽음 뱃지, 미리보기 텍스트 |
| `chat-conversation.tsx` | 메인 채팅 뷰 - 무한스크롤 메시지, 보내기/수정/삭제/리액션, WebSocket 실시간 |
| `chat-thread.tsx` | 쓰레드 뷰 - 부모 메시지 + 답글, 별도 입력 + 스크롤 |
| `chat-message-item.tsx` | 개별 메시지 - 수정모드, 리액션, 쓰레드 답글 카운트, 호버 액션 |
| `chat-input.tsx` | 메시지 입력 textarea - 파일 첨부, 자동 높이, Enter로 전송 |
| `chat-emoji-picker.tsx` | Popover 이모지 선택기 - 16개 기본 리액션 |
| `chat-page-button.tsx` | 페이지별 채팅 룸 생성/열기 버튼 |
| `chat-user-picker.tsx` | DM 대상 유저 검색 인터페이스 |

## For AI Agents

### Working In This Directory
- 채팅 상태는 `hooks/use-chat-store.ts` Zustand 스토어로 관리
- 데이터 페칭은 `hooks/use-chat.ts` React Query 훅 사용
- 실시간 동기화는 `hooks/use-chat-ws.ts` WebSocket 훅 사용
- i18n은 `hooks/use-chat-t.ts` → `lib/chat-i18n.ts` 번역 체인

### Common Patterns
- 무한스크롤: `useInfiniteQuery` + `IntersectionObserver`
- 메시지 전송: `useSendMessage` mutation → WebSocket broadcast → 수신 측 캐시 업데이트
- 리액션: optimistic update + 서버 동기화
- 쓰레드: parentId로 메시지 체이닝

### Data Flow
1. `chat-widget` → `chat-window` (탭 상태)
2. `chat-room-list` → 룸 선택 → `chat-conversation` (메시지 로드)
3. `chat-message-item` → 쓰레드 클릭 → `chat-thread` (답글 로드)
4. WebSocket 이벤트 → React Query 캐시 업데이트 → UI 자동 리렌더

## Dependencies

### Internal
- `hooks/use-chat.ts` - 채팅 CRUD 훅
- `hooks/use-chat-ws.ts` - WebSocket 훅
- `hooks/use-chat-store.ts` - UI 상태
- `hooks/use-chat-t.ts` - i18n
- `lib/chat-utils.ts` - 시간 포맷팅

<!-- MANUAL: -->
