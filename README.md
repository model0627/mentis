# Mentis

Notion 스타일의 실시간 협업 문서 편집기. Next.js 16 App Router, BlockNote 에디터, Yjs CRDT 기반 동시 편집을 지원합니다.

## 주요 기능

- **계층형 문서 관리** - 무한 깊이의 부모-자식 트리 구조, 브레드크럼 네비게이션
- **실시간 협업 편집** - Yjs + WebSocket 기반 동시 편집, 접속자 표시
- **리치 텍스트 에디터** - BlockNote 기반 블록 에디터 (파일 업로드, 이미지, 테이블 등)
- **권한 관리** - 워크스페이스(private/shared) + 역할 기반 접근 제어 (admin/editor/viewer)
- **문서 퍼블리싱** - 공개 URL로 문서 공유
- **커버 이미지 & 아이콘** - 문서별 커버 이미지와 이모지 아이콘
- **커맨드 팔레트** - `Cmd+K`로 문서 빠른 검색
- **휴지통 & 복원** - 재귀적 아카이브/복원
- **다크 모드** - 라이트/다크 테마 전환
- **인증** - 자체 인증 (이메일/비밀번호) + Okta SSO (선택)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, Standalone) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 + Radix UI + shadcn/ui |
| Database | PostgreSQL 16 + Drizzle ORM |
| Auth | NextAuth v5 (JWT) |
| Editor | BlockNote + Yjs |
| State | TanStack React Query 5 + Zustand 5 |
| Realtime | y-websocket (CRDT) |
| Deploy | Docker Compose |

## 시작하기

### 사전 요구사항

- Docker & Docker Compose

### 실행

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 AUTH_SECRET 등 값을 설정

# 2. 전체 스택 실행 (postgres + yjs + app)
docker compose up -d

# 3. 최초 실행 시 DB 마이그레이션
docker compose exec app node scripts/migrate.mjs

# http://localhost:8000 접속
```

> **참고**: 마이그레이션은 최초 1회만 실행하면 됩니다. `CREATE TABLE IF NOT EXISTS`를 사용하므로 중복 실행해도 안전합니다.

## 환경 변수

`.env.example`을 참고하여 `.env` 파일을 생성합니다.

```bash
# 데이터베이스
DATABASE_URL=postgresql://notion:notion@postgres:5432/sootion
POSTGRES_USER=notion
POSTGRES_PASSWORD=notion

# 인증 (필수)
AUTH_SECRET=your-random-secret-here

# Okta SSO (선택)
AUTH_OKTA_ID=
AUTH_OKTA_SECRET=
AUTH_OKTA_ISSUER=https://your-okta-domain.okta.com/oauth2/default

# 실시간 협업 WebSocket (비워두면 자동 감지)
NEXT_PUBLIC_YJS_WS_URL=
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run db:generate` | Drizzle 마이그레이션 생성 |
| `npm run db:push` | DB 스키마 푸시 |
| `npm run db:studio` | Drizzle Studio (DB GUI) |

## 프로젝트 구조

```
mentis/
├── app/
│   ├── (auth)/              # 로그인, 회원가입
│   ├── (main)/              # 메인 앱 (사이드바 + 에디터)
│   │   └── (routes)/documents/[documentId]/
│   ├── (marketing)/         # 랜딩 페이지
│   ├── (public)/            # 퍼블리시된 문서 프리뷰
│   └── api/                 # API 라우트
│       ├── documents/       #   문서 CRUD + 권한
│       ├── users/           #   사용자 검색
│       ├── upload/          #   파일 업로드
│       └── auth/            #   NextAuth
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트 (Radix UI)
│   ├── modals/              # 모달 (설정, 커버 이미지, 권한, 확인)
│   ├── providers/           # Theme, Query, Modal 프로바이더
│   └── editor.tsx           # BlockNote + Yjs 에디터
├── hooks/                   # React Query 훅, Zustand 스토어
├── lib/
│   ├── db/                  # Drizzle ORM (schema, connection)
│   ├── api.ts               # API 클라이언트
│   └── permissions.ts       # 권한 헬퍼 함수
├── scripts/
│   ├── migrate.mjs          # DB 마이그레이션
│   └── yjs-server.cjs       # Yjs WebSocket 서버
├── docker-compose.yml       # Docker 오케스트레이션
└── docs/
    └── ARCHITECTURE.md      # 상세 아키텍처 문서
```

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │ React 19 │  │ React     │  │ BlockNote Editor     │ │
│  │ (Radix/  │  │ Query 5   │  │ + Yjs Provider       │ │
│  │  shadcn) │  │ (Server   │  │ (CRDT Sync)          │ │
│  │          │  │  State)   │  │                      │ │
│  └────┬─────┘  └─────┬─────┘  └──────────┬───────────┘ │
│       │              │                    │             │
│  ┌────┴──────────────┴────┐    ┌─────────┴──────────┐  │
│  │ Zustand 5 (UI State)  │    │ y-websocket Client │  │
│  └────────────────────────┘    └─────────┬──────────┘  │
└──────────────────────┬───────────────────┬──────────────┘
                       │ HTTP/REST         │ WebSocket
                       ▼                   ▼
┌──────────────────────────────┐  ┌──────────────────┐
│   Next.js 16 API Routes     │  │  Yjs WebSocket   │
│   (Standalone Server)       │  │  Server (:1234)  │
│                              │  │                  │
│  ┌────────────┐ ┌─────────┐ │  │  Real-time doc   │
│  │ NextAuth   │ │ Drizzle │ │  │  synchronization │
│  │ v5 (JWT)  │ │ ORM     │ │  │  + presence      │
│  └────────────┘ └────┬────┘ │  └──────────────────┘
│                      │      │
└──────────────────────┼──────┘
                       │
                       ▼
              ┌─────────────────┐
              │  PostgreSQL 16  │
              │                 │
              │  users          │
              │  documents      │
              │  permissions    │
              └─────────────────┘
```

### 데이터 흐름

1. **문서 CRUD**: Client → React Query → API Routes → Drizzle ORM → PostgreSQL
2. **실시간 편집**: Client → y-websocket → Yjs WebSocket Server → 다른 클라이언트로 브로드캐스트
3. **인증**: Client → NextAuth → JWT 토큰 → Middleware 검증
4. **파일 업로드**: Client → `/api/upload` → 로컬 파일시스템 (`/public/uploads/`)
5. **권한 관리**: Client → `/api/documents/[id]/permissions` → documentPermissions 테이블

상세 아키텍처 문서: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Docker 서비스

| 서비스 | 포트 | 설명 |
|--------|------|------|
| `app` | 8000 | Next.js 앱 (standalone) |
| `postgres` | 5432 (내부) | PostgreSQL 16 Alpine |
| `yjs` | 1234 | Yjs WebSocket 서버 |

## 라이선스

Private
