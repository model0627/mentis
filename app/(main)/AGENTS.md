<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# (main)

## Purpose
인증된 사용자의 메인 앱 영역. 문서 편집기, 사이드바 네비게이션, 채팅 위젯을 포함하는 핵심 워크스페이스.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | 보호된 레이아웃 - 세션 체크, Navigation 사이드바, SearchCommand, ChatWidget |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(routes)/` | 페이지 라우트 - 문서 목록, 개별 문서 편집기 |
| `_components/` | 메인 앱 전용 컴포넌트 - 사이드바, 네비바, 문서 트리 등 |

## For AI Agents

### Working In This Directory
- `layout.tsx`에서 `useSession()` 으로 인증 확인, 미인증 시 `/login` 리다이렉트
- Navigation 사이드바는 리사이저블 (240-480px)
- `_components/`의 컴포넌트는 이 라우트 그룹에서만 사용

### Key Components in _components/

| Component | Description |
|-----------|-------------|
| `navigation.tsx` | 접이식 사이드바 - 문서 트리, 휴지통, 검색, 설정 |
| `navbar.tsx` | 상단 바 - 브레드크럼, 협업자 아바타, 권한, 게시, 메뉴 |
| `document-list.tsx` | 재귀 문서 트리 렌더러 |
| `item.tsx` | 사이드바 아이템 - 확장/보관/생성 액션 |
| `search-command.tsx` | Cmd+K 커맨드 팔레트 검색 |
| `trash-box.tsx` | 삭제된 문서 관리 - 필터, 복원, 영구삭제 |
| `menu.tsx` | 문서 드롭다운 메뉴 - 복사, 복제, 이동, 보관, 잠금, 권한 |
| `title.tsx` | 편집 가능 문서 제목 input |
| `banner.tsx` | 보관된 문서 배너 - 복원/삭제 |
| `publish.tsx` | 공개 공유 토글 + URL 복사 |
| `collaborators.tsx` | 실시간 협업자 아바타 (presence 추적) |
| `user-item.tsx` | 워크스페이스 드롭다운 - 계정, 멤버 관리, 로그아웃 |

<!-- MANUAL: -->
