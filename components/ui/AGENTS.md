<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# ui

## Purpose
Shadcn/Radix UI 기반 프리미티브 컴포넌트. `npx shadcn-ui` 로 생성된 저수준 UI 빌딩 블록.

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | 멀티 variant 버튼 (default/outline/ghost/destructive/link, sm/default/lg) |
| `dialog.tsx` | Dialog 컴파운드 컴포넌트 - overlay, content, header, title, description |
| `command.tsx` | cmdk 기반 커맨드 팔레트 - dialog 통합 |
| `dropdown-menu.tsx` | 드롭다운 메뉴 - sub-menu, checkbox, radio, separator |
| `alert-dialog.tsx` | 경고 다이얼로그 - destructive 액션용 |
| `avatar.tsx` | 아바타 - 이미지 + fallback (이니셜/아이콘) |
| `popover.tsx` | Popover 포지셔닝 - 애니메이션 포함 |
| `input.tsx` | 스타일드 HTML input 래퍼 |
| `label.tsx` | 폼 레이블 - CVA variant 사용 |
| `skeleton.tsx` | 로딩 플레이스홀더 애니메이션 |

## For AI Agents

### Working In This Directory
- 이 디렉토리의 파일은 Shadcn CLI로 생성됨 - 직접 수정 가능하나 패턴 유지 권장
- `React.forwardRef` + `displayName` 패턴 사용
- CVA (`class-variance-authority`)로 variant 정의
- `cn()` 유틸리티(`lib/utils.ts`)로 클래스 병합

### Common Patterns
- 컴파운드 컴포넌트: Root, Trigger, Content, Item 등 서브 컴포넌트 export
- Radix UI 프리미티브를 래핑하여 Tailwind 스타일 적용
- `React.ComponentProps<typeof Primitive>` 타입 확장

<!-- MANUAL: -->
