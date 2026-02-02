<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# components

## Purpose
재사용 가능한 React 컴포넌트 모음. Shadcn UI 기반 프리미티브, 문서 편집 도구, 채팅 시스템, 모달, 프로바이더 포함.

## Key Files

| File | Description |
|------|-------------|
| `editor.tsx` | BlockNote 리치 텍스트 에디터 - Yjs 협업, 파일 업로드, 테마 지원 |
| `toolbar.tsx` | 문서 헤더 툴바 - 제목 편집, 아이콘/커버 버튼, Yjs 실시간 타이틀 동기화 |
| `cover.tsx` | 문서 커버 이미지 표시 및 변경/삭제 |
| `icon-picker.tsx` | Emoji 선택기 - radix-ui Popover + emoji-picker-react |
| `single-image-dropzone.tsx` | React Dropzone 기반 단일 이미지 업로드 |
| `spinner.tsx` | 로딩 스피너 (sm/default/lg/icon 사이즈) |
| `mode-toggle.tsx` | 테마 전환 드롭다운 (light/dark/system) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `chat/` | 실시간 채팅 시스템 컴포넌트 (see `chat/AGENTS.md`) |
| `modals/` | 다이얼로그/모달 인터페이스 (see `modals/AGENTS.md`) |
| `providers/` | Context 프로바이더 (Theme, Query, Modal) (see `providers/AGENTS.md`) |
| `ui/` | Shadcn 기반 UI 프리미티브 (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 컴포넌트는 named export 사용 (`export const ComponentName`)
- `editor.tsx`는 dynamic import로 SSR 비활성화 필요 (`next/dynamic`)
- `toolbar.tsx`는 Yjs titleText와 동기화 - YText observe 패턴 사용

### Common Patterns
- Shadcn 컴포넌트: `components/ui/` 에서 import
- 모달 상태: Zustand store hook (`usePermissionsModal`, `useMembersModal` 등)
- 데이터 페칭: React Query hooks (`useDocument`, `useChatRooms` 등)

## Dependencies

### Internal
- `hooks/` - 커스텀 훅 (데이터 페칭, 상태관리)
- `lib/` - 유틸리티, API 클라이언트, 타입

### External
- `@blocknote/react` - 리치 텍스트 에디터
- `radix-ui` - UI 프리미티브
- `emoji-picker-react` - Emoji 선택
- `react-dropzone` - 파일 드래그앤드롭
- `lucide-react` - 아이콘

<!-- MANUAL: -->
