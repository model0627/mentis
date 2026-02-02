<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# Mentis

## Purpose
Notion 스타일의 협업 문서 편집기. Next.js 16 기반, 실시간 공동편집(Yjs), 채팅, 권한관리, Okta SSO를 지원하는 풀스택 워크스페이스 애플리케이션.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | NextAuth v5 설정 - Credentials + Okta 프로바이더, JWT 콜백, 로그인 시 유저 자동생성 |
| `auth.config.ts` | Edge 호환 NextAuth 설정 - JWT 전략, 세션 콜백, 공개 경로 |
| `middleware.ts` | 인증 미들웨어 - 공개 경로 화이트리스트, 미인증 시 로그인 리다이렉트 |
| `next.config.ts` | Next.js 설정 - standalone 빌드, 이미지 최적화 off, /uploads 리라이트 |
| `drizzle.config.ts` | Drizzle ORM 설정 - PostgreSQL, 스키마 경로 `./lib/db/schema.ts` |
| `docker-compose.yml` | Docker 구성 - PostgreSQL 16, Yjs WebSocket 서버, Next.js 앱 (port 8000) |
| `Dockerfile` | Next.js 앱 컨테이너 빌드 |
| `Dockerfile.yjs` | Yjs WebSocket 서버 컨테이너 빌드 |
| `package.json` | 의존성 정의 (React 19, Next.js 16, Drizzle, BlockNote, Yjs, Zustand) |
| `components.json` | Shadcn UI 컴포넌트 설정 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router 페이지 및 API 라우트 (see `app/AGENTS.md`) |
| `components/` | 재사용 가능한 React 컴포넌트 (see `components/AGENTS.md`) |
| `hooks/` | 커스텀 React 훅 - 데이터 페칭, 상태관리, 실시간 (see `hooks/AGENTS.md`) |
| `lib/` | 유틸리티, API 클라이언트, DB 스키마, 타입 (see `lib/AGENTS.md`) |
| `types/` | TypeScript 타입 선언 (NextAuth 모듈 확장) |
| `public/` | 정적 파일 및 업로드 디렉토리 |
| `scripts/` | 유틸리티 스크립트 |
| `docs/` | 프로젝트 문서 및 스크린샷 |

## For AI Agents

### Working In This Directory
- Docker 기반 개발: `docker compose up` 으로 PostgreSQL, Yjs, App 서비스 실행
- DB 마이그레이션: `npm run db:push` (Drizzle Kit)
- 빌드 확인: `npm run build` 또는 `npx tsc --noEmit`
- 환경변수: `.env` 파일에 DATABASE_URL, AUTH_SECRET, AUTH_OKTA_* 설정

### Architecture
- **인증**: NextAuth v5 (beta) - Credentials + Okta SSO, JWT 전략, Edge 미들웨어 분리
- **DB**: Drizzle ORM + PostgreSQL - users, documents, documentPermissions, chatRooms, chatMessages, chatReactions, invitations 테이블
- **실시간**: Yjs WebSocket (문서 공동편집) + 커스텀 WebSocket (채팅)
- **상태관리**: React Query (서버 상태) + Zustand (클라이언트 상태)
- **UI**: Shadcn/Radix UI + Tailwind CSS v4 + BlockNote 에디터

### Common Patterns
- API 라우트에서 `auth()` 로 세션 확인 후 권한 체크
- React Query hooks (`use-documents.ts`, `use-chat.ts`)로 서버 데이터 관리
- Zustand store로 모달/UI 상태 관리 (`use-chat-store.ts`, `use-*-modal.ts`)
- 문서 권한: workspace role (owner/admin/member) + document role (admin/editor/viewer)

### Testing Requirements
- `npm run build` - 빌드 에러 없는지 확인
- `npx tsc --noEmit` - 타입 에러 확인
- `npx next lint` - ESLint 규칙 확인

## Dependencies

### External
- `next` 16.x - React 프레임워크
- `next-auth` 5.x (beta) - 인증
- `drizzle-orm` 0.45.x - ORM
- `@blocknote/react` 0.46.x - 리치 텍스트 에디터
- `yjs` 13.x + `y-websocket` 3.x - 실시간 협업
- `@tanstack/react-query` 5.x - 서버 상태 관리
- `zustand` 5.x - 클라이언트 상태 관리
- `radix-ui` 1.x - UI 프리미티브
- `tailwindcss` 4.x - CSS 프레임워크

<!-- MANUAL: -->
