<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# providers

## Purpose
전역 Context 프로바이더. 테마, React Query, 세션, 모달을 앱 전체에 제공.

## Key Files

| File | Description |
|------|-------------|
| `theme-provider.tsx` | next-themes ThemeProvider 래퍼 - 다크모드 지원 |
| `query-provider.tsx` | TanStack React Query QueryClientProvider + NextAuth SessionProvider |
| `modal-provider.tsx` | 중앙 모달 프로바이더 - Settings, Cover, Permissions, Members, Move 모달 렌더링 |

## For AI Agents

### Working In This Directory
- 프로바이더 순서: `query-provider` (최외곽) → `theme-provider` → `modal-provider`
- `app/layout.tsx`에서 `QueryProvider`로 감싸고 내부에 나머지 프로바이더 중첩
- 새 전역 모달 추가 시 `modal-provider.tsx`에 등록

<!-- MANUAL: -->
