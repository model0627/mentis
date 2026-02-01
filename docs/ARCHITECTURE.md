# Mentis - Architecture Documentation

> Notion 스타일의 실시간 협업 문서 편집기

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [디렉토리 구조](#디렉토리-구조)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [인증 시스템](#인증-시스템)
- [권한 시스템](#권한-시스템)
- [API 라우트](#api-라우트)
- [상태 관리](#상태-관리)
- [실시간 협업](#실시간-협업)
- [컴포넌트 아키텍처](#컴포넌트-아키텍처)
- [스타일링 시스템](#스타일링-시스템)
- [배포 구성](#배포-구성)

---

## 프로젝트 개요

Mentis는 Next.js 16 App Router 기반의 Notion 클론 프로젝트로, 실시간 협업 편집, 계층형 문서 관리, 역할 기반 권한, 문서 퍼블리싱 기능을 제공합니다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **계층형 문서** | 부모-자식 관계의 트리 구조 문서 관리 + 브레드크럼 네비게이션 |
| **실시간 협업** | BlockNote + Yjs 기반 동시 편집 및 접속자 표시 |
| **리치 에디터** | 파일 업로드, 커버 이미지, 이모지 아이콘 지원 |
| **권한 관리** | 워크스페이스(private/shared) + 역할 기반 접근 제어 |
| **문서 퍼블리싱** | 공개 URL을 통한 문서 공유 |
| **인증** | 자체 인증 + Okta SSO (선택적) |
| **다크 모드** | next-themes 기반 테마 전환 |

---

## 기술 스택

### Frontend

| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js | 16.1.x | App Router, SSR, API Routes, Standalone 빌드 |
| React | 19.2.x | UI 렌더링 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.1.x | CSS-first 유틸리티 스타일링 (`@theme` 디렉티브) |
| Radix UI | 1.4.x | 통합 패키지 — 접근성 기반 UI 프리미티브 |
| shadcn/ui | - | 사전 스타일링된 컴포넌트 |
| BlockNote | 0.46.x | 리치 텍스트 에디터 |
| Yjs | 13.6.x | CRDT 기반 실시간 동기화 |

### Backend / Data

| 기술 | 버전 | 역할 |
|------|------|------|
| PostgreSQL | 16 | 기본 데이터베이스 |
| Drizzle ORM | 0.45.x | 타입 안전 쿼리 빌더 |
| NextAuth | 5.0.0-beta.30 | JWT 세션 인증 |
| y-websocket | 3.0.x | Yjs WebSocket 서버 |

### 상태 관리

| 기술 | 버전 | 역할 |
|------|------|------|
| TanStack React Query | 5.90.x | 서버 상태 관리 (캐싱, 동기화) |
| Zustand | 5.0.x | 클라이언트 UI 상태 (모달, 검색) |

### 빌드 & 개발

| 기술 | 버전 | 역할 |
|------|------|------|
| ESLint | 9.x | Flat Config 기반 린팅 |
| Drizzle Kit | 0.31.x | DB 마이그레이션 |
| PostCSS | 8.x | `@tailwindcss/postcss` 플러그인 |
| Node.js | 20+ | 런타임 (Next.js 16 요구사항) |

---

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

---

## 디렉토리 구조

```
mentis/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # 인증 페이지 (로그인, 회원가입)
│   │   ├── layout.tsx               # 중앙 정렬 레이아웃
│   │   ├── login/page.tsx           # 로그인 (Credentials + Okta)
│   │   └── register/page.tsx        # 회원가입
│   │
│   ├── (main)/                       # 인증 필요 - 메인 앱
│   │   ├── layout.tsx               # 사이드바 포함 레이아웃
│   │   ├── (routes)/documents/
│   │   │   ├── page.tsx             # 문서 목록 / 웰컴
│   │   │   └── [documentId]/page.tsx # 문서 에디터
│   │   └── _components/             # 메인 레이아웃 전용 컴포넌트
│   │       ├── navigation.tsx       # 리사이즈 가능 사이드바
│   │       ├── document-list.tsx    # 재귀적 문서 트리
│   │       ├── search-command.tsx   # 커맨드 팔레트 (Cmd+K)
│   │       ├── navbar.tsx           # 상단 네비게이션 바 + 브레드크럼
│   │       ├── collaborators.tsx    # 실시간 접속자 표시
│   │       ├── publish.tsx          # 퍼블리시 다이얼로그
│   │       ├── trash-box.tsx        # 휴지통 UI
│   │       └── ...
│   │
│   ├── (marketing)/                  # 공개 랜딩 페이지
│   │   └── _components/             # 히어로, 네비바, 푸터
│   │
│   ├── (public)/                     # 공개 문서 프리뷰
│   │   └── (routes)/preview/[documentId]/page.tsx
│   │
│   ├── api/                          # API 라우트
│   │   ├── auth/[...nextauth]/      # NextAuth 핸들러
│   │   ├── register/                # 회원가입 API
│   │   ├── documents/               # 문서 CRUD API
│   │   │   └── [id]/permissions/    # 문서 권한 API
│   │   ├── users/                   # 사용자 검색 API
│   │   ├── upload/                  # 파일 업로드 API
│   │   └── uploads/[filename]/      # 업로드 파일 서빙
│   │
│   ├── layout.tsx                    # 루트 레이아웃 (프로바이더)
│   └── globals.css                   # Tailwind v4 @theme + 디자인 토큰
│
├── components/                       # 공유 컴포넌트
│   ├── ui/                          # shadcn/Radix 프리미티브
│   ├── modals/                      # 모달 컴포넌트
│   │   ├── cover-image-modal.tsx    # 커버 이미지 업로드
│   │   ├── confirm-modal.tsx        # 확인 다이얼로그
│   │   ├── settings-modal.tsx       # 설정 (테마 등)
│   │   └── permissions-modal.tsx    # 문서 권한 관리
│   ├── providers/                   # Context 프로바이더
│   ├── editor.tsx                   # BlockNote + Yjs 에디터
│   ├── toolbar.tsx                  # 문서 헤더 툴바
│   ├── cover.tsx                    # 커버 이미지 컴포넌트
│   └── icon-picker.tsx              # 이모지 선택기
│
├── hooks/                            # 커스텀 React Hooks
│   ├── use-documents.ts             # React Query 문서 훅 + breadcrumbs
│   ├── use-search.tsx               # 검색 모달 상태 (Zustand)
│   ├── use-settings.tsx             # 설정 모달 상태 (Zustand)
│   ├── use-cover-image.tsx          # 커버 이미지 모달 상태
│   ├── use-permissions-modal.ts     # 권한 모달 상태
│   └── use-presence.ts             # Yjs 접속자 상태
│
├── lib/                              # 유틸리티 & 라이브러리
│   ├── db/
│   │   ├── index.ts                 # DB 연결 (postgres + Drizzle)
│   │   └── schema.ts               # 테이블 스키마 정의
│   ├── api.ts                       # API 클라이언트 래퍼
│   ├── permissions.ts               # 권한 검사 헬퍼 함수
│   ├── types.ts                     # TypeScript 타입 정의
│   ├── mime.ts                      # MIME 타입 유틸리티
│   ├── upload.ts                    # 파일 업로드 클라이언트
│   └── utils.ts                     # cn() 유틸리티 (clsx + twMerge)
│
├── scripts/                          # 유틸리티 스크립트
│   ├── yjs-server.cjs               # Yjs WebSocket 서버
│   └── migrate.mjs                  # DB 마이그레이션
│
├── auth.ts                           # NextAuth 인스턴스
├── auth.config.ts                    # 인증 설정
├── middleware.ts                     # 라우트 보호 미들웨어
├── drizzle.config.ts                 # Drizzle ORM 설정
├── eslint.config.mjs                 # ESLint 9 Flat Config
├── next.config.ts                    # Next.js 설정 (TypeScript)
├── postcss.config.js                 # PostCSS (@tailwindcss/postcss)
├── docker-compose.yml                # Docker 오케스트레이션
├── Dockerfile                        # 앱 컨테이너 (multi-stage)
└── Dockerfile.yjs                    # Yjs 서버 컨테이너
```

### Route Groups 설계

Next.js App Router의 Route Group `(groupName)` 패턴을 활용하여 URL 경로에 영향 없이 레이아웃을 분리합니다:

| Route Group | 레이아웃 | 접근 권한 | 용도 |
|-------------|----------|----------|------|
| `(auth)` | 중앙 정렬 | 공개 | 로그인/회원가입 |
| `(main)` | 사이드바 + 네비바 | 인증 필요 | 메인 앱 |
| `(marketing)` | 마케팅 레이아웃 | 공개 | 랜딩 페이지 |
| `(public)` | 최소 레이아웃 | 공개 | 퍼블리시된 문서 프리뷰 |

---

## 데이터베이스 스키마

### ERD

```
┌──────────────────────────────────┐
│             users                │
├──────────────────────────────────┤
│ id           UUID     PK        │
│ name         TEXT     nullable   │
│ email        TEXT     UNIQUE     │
│ passwordHash TEXT     nullable   │
│ provider     TEXT     "credentials" │
│ providerId   TEXT     nullable   │
│ image        TEXT     nullable   │
│ createdAt    TIMESTAMP           │
└──────────────────────────────────┘
         │
         │ userId (논리적 참조)
         ▼
┌──────────────────────────────────┐
│           documents              │
├──────────────────────────────────┤
│ id             UUID     PK      │
│ title          TEXT              │
│ userId         TEXT     indexed  │
│ isArchived     BOOLEAN  false    │
│ isPublished    BOOLEAN  false    │
│ parentDocument UUID     FK(self) │ ── SET NULL on delete
│ content        TEXT     nullable │
│ coverImage     TEXT     nullable │
│ icon           TEXT     nullable │
│ workspace      TEXT     "private" │ ── "private" | "shared"
│ createdAt      TIMESTAMP         │
│ updatedAt      TIMESTAMP         │
├──────────────────────────────────┤
│ IDX: user_id                     │
│ IDX: user_id + parentDocument    │
│ IDX: workspace                   │
└──────────────────────────────────┘
         │
         │ documentId (FK, CASCADE)
         ▼
┌──────────────────────────────────┐
│     documentPermissions          │
├──────────────────────────────────┤
│ id           UUID     PK        │
│ documentId   UUID     FK        │ ── CASCADE on delete
│ userId       TEXT     NOT NULL   │
│ role         TEXT     "viewer"   │ ── "admin" | "editor" | "viewer"
│ createdAt    TIMESTAMP           │
├──────────────────────────────────┤
│ UNIQUE: (documentId, userId)     │
│ IDX: userId                      │
└──────────────────────────────────┘
```

### 주요 설계 결정

- **Self-referencing FK**: `parentDocument`가 같은 테이블의 `id`를 참조하여 무한 깊이의 트리 구조 지원
- **SET NULL on delete**: 부모 삭제 시 자식 문서는 루트 레벨로 이동
- **CASCADE on permissions**: 문서 삭제 시 관련 권한도 자동 삭제
- **workspace 필드**: `"private"` (개인) / `"shared"` (공유) 접근 범위 구분
- **userId**: 외래 키 제약 조건 없이 인덱스만 적용 (유연성)
- **content**: BlockNote 에디터의 JSON 문서를 TEXT로 저장

---

## 인증 시스템

### 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Login UI   │────▶│  NextAuth    │────▶│  JWT Token      │
│             │     │  v5 (beta)   │     │  (Stateless)    │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                           │                      │
              ┌────────────┴──────────┐           │
              ▼                       ▼           ▼
     ┌──────────────┐      ┌──────────────┐  ┌──────────┐
     │ Credentials  │      │ Okta SSO     │  │Middleware│
     │ (bcryptjs)   │      │ (Optional)   │  │(Route    │
     └──────────────┘      └──────────────┘  │ Guard)   │
                                              └──────────┘
```

### 인증 플로우

1. **Credentials 로그인**: 이메일 + 비밀번호 → bcrypt 검증 → JWT 발급
2. **Okta SSO** (선택적): OAuth 플로우 → 자동 사용자 생성/조회 → JWT 발급
3. **세션 관리**: JWT 전략 (서버 사이드 세션 없음)
4. **라우트 보호**: `middleware.ts`에서 공개 경로 화이트리스트 방식

### 공개 경로

```
/                          # 랜딩 페이지
/login, /register          # 인증 페이지
/api/auth/*                # NextAuth 핸들러
/api/register              # 회원가입 API
/api/documents/public/*    # 퍼블리시된 문서 API
/preview/*                 # 문서 프리뷰
```

---

## 권한 시스템

### 워크스페이스 모델

| 워크스페이스 | 접근 범위 | 설명 |
|-------------|----------|------|
| `private` | 소유자만 | 기본값. 문서 생성자만 접근 가능 |
| `shared` | 소유자 + 초대된 사용자 | 역할 기반 접근 제어 |

### 역할 (Role)

| 역할 | 읽기 | 편집 | 삭제 | 권한 관리 |
|------|------|------|------|-----------|
| `viewer` | O | X | X | X |
| `editor` | O | O | X | X |
| `admin` | O | O | O | O |

### 권한 검사 흐름

```
요청 → 세션 확인 → 문서 조회
  → private? → userId === session.userId
  → shared?  → userId === session.userId (소유자)
             → OR documentPermissions에서 역할 확인
  → published? → 공개 읽기 허용
```

---

## API 라우트

### 문서 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/documents` | `GET` | O | 문서 검색 (제목 기준) |
| `/api/documents` | `POST` | O | 새 문서 생성 |
| `/api/documents/sidebar` | `GET` | O | 사이드바 트리 조회 (부모별 자식) |
| `/api/documents/trash` | `GET` | O | 휴지통 문서 목록 |
| `/api/documents/public/[id]` | `GET` | X | 퍼블리시된 문서 조회 |
| `/api/documents/[id]` | `GET` | △ | 문서 조회 (퍼블리시 시 공개) |
| `/api/documents/[id]` | `PATCH` | O | 문서 수정 (제목, 내용, 커버 등) |
| `/api/documents/[id]` | `DELETE` | O | 문서 영구 삭제 |
| `/api/documents/[id]/archive` | `PATCH` | O | 문서 재귀적 아카이브 |
| `/api/documents/[id]/restore` | `PATCH` | O | 문서 재귀적 복원 |
| `/api/documents/[id]/icon` | `DELETE` | O | 아이콘 제거 |
| `/api/documents/[id]/cover` | `DELETE` | O | 커버 이미지 제거 |
| `/api/documents/[id]/permissions` | `GET` | O | 문서 권한 목록 조회 |
| `/api/documents/[id]/permissions` | `POST` | O | 권한 추가 (사용자 초대) |
| `/api/documents/[id]/permissions` | `DELETE` | O | 권한 제거 |

### 파일 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/upload` | `POST` | O | 파일 업로드 (UUID 접두사) |
| `/api/upload` | `DELETE` | O | 업로드된 파일 삭제 |
| `/api/uploads/[filename]` | `GET` | X | 업로드 파일 서빙 |

### 사용자 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/users/search` | `GET` | O | 사용자 검색 (권한 부여용) |

### 인증 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/auth/[...nextauth]` | `*` | X | NextAuth 핸들러 |
| `/api/register` | `POST` | X | 신규 사용자 등록 |

---

## 상태 관리

### 계층 구조

```
┌─────────────────────────────────────────────────┐
│                  상태 관리 계층                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │     TanStack React Query (서버 상태)       │  │
│  │                                           │  │
│  │  • 문서 CRUD 쿼리 & 뮤테이션               │  │
│  │  • 자동 캐시 무효화                        │  │
│  │  • staleTime: 60초                        │  │
│  │  • 윈도우 포커스 시 리페치                  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │     Zustand 5 (클라이언트 UI 상태)         │  │
│  │                                           │  │
│  │  • useSearch: 검색 모달 open/close         │  │
│  │  • useSettings: 설정 모달 open/close       │  │
│  │  • useCoverImage: 커버 이미지 모달          │  │
│  │  • usePermissionsModal: 권한 관리 모달      │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │     Yjs Awareness (실시간 상태)             │  │
│  │                                           │  │
│  │  • usePresence: 현재 접속자 정보            │  │
│  │  • 사용자별 색상, 커서 위치, lastSeen       │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### React Query 훅 (`hooks/use-documents.ts`)

**Queries:**
- `useSearchDocs()` - 문서 검색
- `useSidebar(parentId?, workspace?)` - 사이드바 트리 데이터
- `useTrash()` - 휴지통 목록
- `useDocument(id)` - 단일 문서 조회
- `usePublicDocument(id)` - 공개 문서 조회
- `useBreadcrumbs(id)` - 조상 문서 경로 (브레드크럼)
- `usePermissions(id)` - 문서 권한 목록
- `useSearchUsers(query)` - 사용자 검색

**Mutations:**
- `useCreateDocument()` - 문서 생성 → 자동으로 사이드바 캐시 무효화
- `useUpdateDocument()` - 문서 수정
- `useArchiveDocument()` - 아카이브
- `useRestoreDocument()` - 복원
- `useRemoveDocument()` - 영구 삭제
- `useRemoveIcon()` - 아이콘 제거
- `useRemoveCoverImage()` - 커버 제거
- `useAddPermission()` - 권한 추가
- `useRemovePermission()` - 권한 제거

---

## 실시간 협업

### 아키텍처

```
┌────────────┐     WebSocket      ┌──────────────────┐     WebSocket     ┌────────────┐
│  Client A  │◄──────────────────▶│  Yjs WebSocket   │◄────────────────▶│  Client B  │
│            │                    │  Server (:1234)  │                   │            │
│  BlockNote │   Yjs Updates      │                  │   Yjs Updates     │  BlockNote │
│  + Yjs Doc │   (CRDT Ops)       │  Document Room   │   (CRDT Ops)      │  + Yjs Doc │
│            │                    │  Management      │                   │            │
│  Awareness │   Presence Info    │                  │   Presence Info   │  Awareness │
│  Provider  │──────────────────▶│  Broadcast       │──────────────────▶│  Provider  │
└────────────┘                    └──────────────────┘                   └────────────┘
```

### 동작 방식

1. **문서 열기**: 클라이언트가 문서 ID 기반 "방"에 WebSocket 접속
2. **CRDT 동기화**: Yjs가 충돌 없는 복제 데이터 타입(CRDT)으로 동시 편집 해결
3. **Awareness**: 접속자 정보 (이름, 색상, lastSeen)를 모든 클라이언트에 브로드캐스트
4. **Persistence**: 문서 내용은 별도로 API를 통해 PostgreSQL에 저장

### 컴포넌트 구현

에디터 (`components/editor.tsx`)에서 Yjs 프로바이더를 생성하고 BlockNote에 연결:

- `WebsocketProvider`: Yjs WebSocket 서버에 연결
- `awareness`: 접속자 상태 공유
- BlockNote `collaboration` 옵션에 `fragment`와 `provider` 전달

---

## 컴포넌트 아키텍처

### Provider 계층

```
<html>
  <body>
    <ThemeProvider>              ← 다크/라이트 테마
      <QueryProvider>            ← React Query + NextAuth Session
        <Toaster />              ← 토스트 알림 (sonner)
        <ModalProvider />        ← 설정, 커버 이미지, 권한 모달
        {children}               ← 페이지 콘텐츠
      </QueryProvider>
    </ThemeProvider>
  </body>
</html>
```

### 주요 페이지 컴포넌트

#### 문서 편집 페이지 (`app/(main)/(routes)/documents/[documentId]/page.tsx`)

```
┌──────────────────────────────────────────────────┐
│ Navigation (Sidebar)    │  Navbar                │
│                         │  ┌──────────────────┐  │
│ • UserItem              │  │ Breadcrumb > Title│  │
│ • Search (Cmd+K)        │  │ Collab  Perm  ⋮  │  │
│ • Settings              │  └──────────────────┘  │
│ • New Page (+)          │                        │
│                         │  Cover Image           │
│ Workspace Tabs:         │  ┌──────────────────┐  │
│  Private | Shared       │  │ Cover             │  │
│                         │  └──────────────────┘  │
│ Document Tree:          │                        │
│ ├── Page 1              │  Toolbar               │
│ │   ├── Sub Page A      │  ┌──────────────────┐  │
│ │   └── Sub Page B      │  │ Icon  Title      │  │
│ ├── Page 2 ◄ active     │  └──────────────────┘  │
│ └── Page 3              │                        │
│                         │  Editor (BlockNote)    │
│ Trash                   │  ┌──────────────────┐  │
│                         │  │ Rich text...     │  │
│                         │  │ with real-time   │  │
│                         │  │ collaboration    │  │
│                         │  └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

### UI 컴포넌트 (`components/ui/`)

shadcn/ui 기반 Radix 프리미티브 (통합 `radix-ui` 패키지):

- `Button` - 다양한 variant (default, destructive, outline, ghost, link)
- `Dialog` - 모달 다이얼로그
- `DropdownMenu` - 드롭다운 메뉴
- `Popover` - 팝오버 (이모지 선택기 등)
- `Command` - 커맨드 팔레트 (cmdk 1.x)
- `AlertDialog` - 확인 다이얼로그
- `Avatar` - 사용자 아바타
- `Input`, `Label` - 폼 요소
- `Skeleton` - 로딩 스켈레톤

---

## 스타일링 시스템

### 구성

- **Tailwind CSS 4** - CSS-first 설정 (`@theme` 디렉티브, `tailwind.config.ts` 불필요)
- **PostCSS** - `@tailwindcss/postcss` 단일 플러그인
- **다크 모드** - next-themes, class 전략, localStorage 저장
- **cn() 유틸리티** - `clsx` + `tailwind-merge` 클래스 병합

```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", conditional && "active-class", className)} />
```

### Tailwind v4 테마 설정 (`globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  /* ... 디자인 토큰 */
}
```

---

## 배포 구성

### Docker Compose 서비스

```
┌─────────────────────────────────────────────────┐
│              Docker Compose Network              │
│              (sootion-net: bridge)                │
│                                                 │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐ │
│  │   postgres   │  │   yjs    │  │    app     │ │
│  │  :5432      │  │  :1234   │  │  :8000     │ │
│  │             │  │          │  │            │ │
│  │ PG 16       │  │ y-ws     │  │ Next.js 16 │ │
│  │ Alpine      │  │ server   │  │ Standalone │ │
│  │             │  │          │  │            │ │
│  │ Volume:     │  │          │  │ Volume:    │ │
│  │  pgdata     │  │          │  │  uploads   │ │
│  └──────┬──────┘  └──────────┘  └─────┬──────┘ │
│         │                             │         │
│         └────── depends_on ───────────┘         │
│           (healthcheck: pg_isready)             │
└─────────────────────────────────────────────────┘
```

### Dockerfile (Multi-stage)

```
Stage 1: deps     → node:20-alpine, npm ci + sharp 설치
Stage 2: builder  → Next.js 빌드 (standalone output)
Stage 3: runner   → standalone 서버 + public/ + uploads 볼륨
                    → CMD: migrate.mjs → server.js
```

### 서비스 설명

| 서비스 | 이미지 | 포트 | 볼륨 | 설명 |
|--------|-------|------|------|------|
| `postgres` | postgres:16-alpine | 5432 (내부) | pgdata | 메인 데이터베이스 |
| `yjs` | 커스텀 (Dockerfile.yjs) | 1234 | - | 실시간 협업 WebSocket |
| `app` | 커스텀 (Dockerfile) | 8000 | uploads | Next.js 앱 (Node 20) |

### 실행

```bash
# 1. 환경 변수 설정
cp .env.example .env

# 2. 전체 스택 실행 (postgres + yjs + app)
docker compose up -d

# 3. 최초 실행 시 DB 마이그레이션
docker compose exec app node scripts/migrate.mjs

# 빌드 확인
docker compose logs -f app
```

> **참고**: 마이그레이션은 최초 1회만 실행하면 됩니다. `CREATE TABLE IF NOT EXISTS`를 사용하므로 중복 실행해도 안전합니다.

---

## 부록: 주요 의존성 목록

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | 16.1.x | App Router, SSR, API Routes |
| `react` / `react-dom` | 19.2.x | UI 렌더링 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.1.x | CSS-first 스타일링 |
| `radix-ui` | 1.4.x | 접근성 UI 프리미티브 (통합 패키지) |
| `@blocknote/core`, `react`, `shadcn` | 0.46.x | 리치 텍스트 에디터 |
| `@tanstack/react-query` | 5.90.x | 서버 상태 관리 |
| `zustand` | 5.0.x | 클라이언트 UI 상태 |
| `drizzle-orm` / `drizzle-kit` | 0.45.x / 0.31.x | PostgreSQL ORM + 마이그레이션 |
| `next-auth` | 5.0.0-beta.30 | 인증 (JWT + OAuth) |
| `bcryptjs` | 3.x | 비밀번호 해싱 |
| `yjs` / `y-websocket` | 13.6.x / 3.0.x | 실시간 CRDT 동기화 |
| `cmdk` | 1.1.x | 커맨드 팔레트 |
| `sonner` | 2.0.x | 토스트 알림 |
| `lucide-react` | 0.563.x | 아이콘 라이브러리 |
| `emoji-picker-react` | 4.5.x | 이모지 선택기 |
| `next-themes` | 0.2.x | 테마 전환 |
| `zod` | 3.22.x | 런타임 스키마 검증 |
| `eslint` / `eslint-config-next` | 9.x / 16.x | Flat Config 린팅 |
