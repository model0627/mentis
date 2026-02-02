<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# lib

## Purpose
공유 유틸리티, API 클라이언트, 데이터베이스 스키마, 타입 정의, 권한 체크 로직.

## Key Files

| File | Description |
|------|-------------|
| `api.ts` | 타입 안전 API 클라이언트 - documentsApi, membersApi, chatApi 객체 |
| `types.ts` | 핵심 TypeScript 인터페이스 - Document, ChatRoom, ChatMessage 등 |
| `permissions.ts` | 권한 체크 함수 - canView/canEdit/canDelete, workspace role 확인 |
| `utils.ts` | CSS 유틸리티 - `cn()` (clsx + tailwind-merge) |
| `upload.ts` | 파일 업로드/삭제 클라이언트 - `fileStorage.upload()`, `fileStorage.delete()` |
| `mime.ts` | MIME 타입 조회 테이블 |
| `chat-i18n.ts` | 채팅 i18n 번역 (한국어/영어) |
| `chat-utils.ts` | 채팅 타임스탬프 상대 시간 포맷팅 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `db/` | Drizzle ORM 데이터베이스 클라이언트 및 스키마 (see `db/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `api.ts` 수정 시 관련 React Query 훅(`hooks/use-*.ts`)도 확인
- `types.ts`의 인터페이스는 API 응답과 DB 스키마 양쪽에서 참조
- `permissions.ts`는 API 라우트와 클라이언트 양쪽에서 사용

### Common Patterns
- API 클라이언트: `fetch()` + JSON 파싱, 에러 시 throw
- 권한: workspace role (owner > admin > member) + document role (admin > editor > viewer)
- 번역: `getChatT(locale)` → 키-값 객체 반환

## Dependencies

### External
- `drizzle-orm` - ORM
- `clsx` + `tailwind-merge` - CSS 유틸리티

<!-- MANUAL: -->
