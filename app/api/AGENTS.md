<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# api

## Purpose
REST API 엔드포인트 모음. 문서 CRUD, 유저 관리, 채팅, 인증, 파일 업로드, 초대 처리.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `auth/` | NextAuth 핸들러 (`[...nextauth]/route.ts`) |
| `register/` | 회원가입 API - bcrypt 해싱 |
| `documents/` | 문서 CRUD + 보관/복원/권한/아이콘/커버/공개 |
| `users/` | 유저 목록/검색/역할변경/활성화/비활성화 |
| `chat/` | 채팅 룸/메시지/리액션/읽음/멤버 |
| `upload/` | 파일 업로드 (POST) |
| `uploads/` | 업로드된 파일 서빙 (`[filename]/route.ts`) |
| `invitations/` | 초대 생성/수락 (`[token]/accept/route.ts`) |
| `cron/` | 크론 작업 엔드포인트 |

## For AI Agents

### Working In This Directory
- 모든 API 라우트는 `auth()` 로 세션 확인 (공개 API 제외)
- 권한 체크: `lib/permissions.ts`의 함수 사용
- DB 쿼리: `drizzle-orm`의 `db.select()`, `db.insert()`, `db.update()`, `db.delete()`
- 에러 응답: `NextResponse.json({ error: "..." }, { status: 4xx })`

### Common Patterns
- `route.ts`에 HTTP 메서드별 named export (`GET`, `POST`, `PATCH`, `DELETE`)
- 동적 라우트: `[id]`, `[token]`, `[roomId]` 등 params 사용
- 인증된 유저 ID: `session.user.id`

### API Endpoint Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/documents` | 문서 검색 (query param) |
| POST | `/api/documents` | 새 문서 생성 |
| GET | `/api/documents/[id]` | 문서 상세 조회 |
| PATCH | `/api/documents/[id]` | 문서 수정 |
| DELETE | `/api/documents/[id]` | 문서 영구 삭제 |
| POST | `/api/documents/[id]/archive` | 문서 보관 |
| POST | `/api/documents/[id]/restore` | 문서 복원 |
| GET/POST/DELETE | `/api/documents/[id]/permissions` | 문서 권한 관리 |
| PATCH | `/api/documents/[id]/icon` | 아이콘 변경 |
| PATCH | `/api/documents/[id]/cover` | 커버 이미지 변경 |
| GET | `/api/documents/public/[id]` | 공개 문서 조회 |
| GET | `/api/documents/sidebar` | 사이드바 문서 트리 |
| GET | `/api/documents/trash` | 휴지통 문서 목록 |
| GET | `/api/users` | 전체 유저 목록 |
| GET | `/api/users/search` | 유저 검색 |
| PATCH | `/api/users/[id]/role` | 역할 변경 |
| POST | `/api/users/[id]/activate` | 유저 활성화 |
| POST | `/api/users/[id]/deactivate` | 유저 비활성화 |
| GET/POST | `/api/chat/rooms` | 채팅 룸 목록/생성 |
| GET/POST | `/api/chat/rooms/[roomId]/messages` | 메시지 목록/전송 |
| PATCH/DELETE | `/api/chat/rooms/[roomId]/messages/[messageId]` | 메시지 수정/삭제 |
| POST/DELETE | `/api/chat/rooms/[roomId]/messages/[messageId]/reactions` | 리액션 추가/삭제 |
| POST | `/api/chat/rooms/[roomId]/read` | 읽음 처리 |
| GET/POST/DELETE | `/api/chat/rooms/[roomId]/members` | 멤버 관리 |
| POST | `/api/register` | 회원가입 |
| POST | `/api/upload` | 파일 업로드 |
| GET | `/api/uploads/[filename]` | 파일 서빙 |
| POST | `/api/invitations` | 초대 생성 |
| POST | `/api/invitations/[token]/accept` | 초대 수락 |

<!-- MANUAL: -->
