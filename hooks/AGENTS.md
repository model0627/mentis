<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# hooks

## Purpose
커스텀 React 훅 모음. React Query 기반 데이터 페칭, Zustand 상태관리, 실시간 동기화(Yjs/WebSocket) 훅 포함.

## Key Files

| File | Description |
|------|-------------|
| `use-documents.ts` | 문서 CRUD React Query 훅 - 사이드바, 검색, 브레드크럼, 권한, 유저 검색 |
| `use-chat.ts` | 채팅 React Query 훅 - 룸, 메시지(무한스크롤), 리액션, 읽음처리, 멤버 |
| `use-chat-ws.ts` | 채팅 WebSocket 훅 - 바이너리 인코딩 프로토콜, 실시간 메시지/리액션 이벤트 |
| `use-chat-store.ts` | 채팅 위젯 Zustand 스토어 - 탭, 현재 룸, 쓰레드, 유저피커 상태 |
| `use-chat-t.ts` | 채팅 i18n 훅 - 현재 로케일 번역 반환 |
| `use-yjs.ts` | Yjs 실시간 동기화 - WebSocketProvider, presence awareness, titleText |
| `use-members.ts` | 워크스페이스 멤버 관리 - 초대, 역할변경, 활성화/비활성화 |
| `use-current-role.ts` | 현재 사용자 워크스페이스 역할 조회 (owner/admin/member) |
| `use-presence.ts` | Zustand 프레전스 스토어 - 문서별 접속 유저 추적 |
| `use-permissions-modal.ts` | 권한 모달 Zustand 스토어 |
| `use-members-modal.ts` | 멤버 모달 Zustand 스토어 |
| `use-move-modal.ts` | 문서 이동 모달 Zustand 스토어 |

## For AI Agents

### Working In This Directory
- React Query 훅은 `lib/api.ts`의 API 클라이언트 사용
- Zustand 스토어는 `create()` 패턴, interface + 구현 분리
- WebSocket 훅(`use-chat-ws.ts`)은 바이너리 프로토콜 - TextEncoder/Decoder 사용

### Common Patterns
- `useQuery` + `useMutation` 조합으로 CRUD 구현
- mutation 성공 시 `queryClient.invalidateQueries()` 로 캐시 무효화
- 무한스크롤: `useInfiniteQuery` + cursor 기반 페이지네이션
- Zustand: `create<Interface>()((set) => ({ ... }))` 패턴

### Testing Requirements
- 훅 변경 시 관련 컴포넌트에서의 사용처 확인
- WebSocket 훅은 Docker 환경에서 Yjs 서버 실행 필요

## Dependencies

### Internal
- `lib/api.ts` - API 클라이언트
- `lib/types.ts` - 도메인 타입
- `lib/chat-i18n.ts` - 채팅 번역

### External
- `@tanstack/react-query` - 서버 상태 관리
- `zustand` - 클라이언트 상태 관리
- `yjs` + `y-websocket` - 실시간 협업
- `next-auth/react` - 세션 조회

<!-- MANUAL: -->
