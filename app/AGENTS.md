<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# app

## Purpose
Next.js App Router 디렉토리. 4개 라우트 그룹과 REST API 엔드포인트를 포함.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | 루트 레이아웃 - QueryProvider, ThemeProvider, ModalProvider, Toaster 래핑 |
| `error.tsx` | 글로벌 에러 바운더리 컴포넌트 |
| `not-found.tsx` | 404 페이지 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)/` | 인증 페이지 - 로그인, 회원가입, 초대 수락 (see `(auth)/AGENTS.md`) |
| `(main)/` | 메인 앱 - 문서 편집기, 사이드바, 채팅 (see `(main)/AGENTS.md`) |
| `(marketing)/` | 마케팅 랜딩 페이지 (see `(marketing)/AGENTS.md`) |
| `(public)/` | 공개 문서 미리보기 (see `(public)/AGENTS.md`) |
| `api/` | REST API 엔드포인트 (see `api/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 라우트 그룹 `()` 괄호는 URL 경로에 영향 없음
- `layout.tsx`에서 전역 프로바이더 순서 중요: Query > Theme > Modal
- `error.tsx`와 `not-found.tsx`는 "use client" 디렉티브 필요

### Common Patterns
- 페이지 컴포넌트는 `page.tsx`, 레이아웃은 `layout.tsx`
- `_components/` 접두사 디렉토리는 해당 라우트 그룹 전용 컴포넌트
- API 라우트는 `route.ts`에 GET/POST/PATCH/DELETE 핸들러

<!-- MANUAL: -->
