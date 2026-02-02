<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# modals

## Purpose
다이얼로그/모달 컴포넌트 모음. 확인, 커버 이미지 업로드, 권한 관리, 문서 이동, 멤버 관리, 설정 모달 포함.

## Key Files

| File | Description |
|------|-------------|
| `confirm-modal.tsx` | 재사용 확인 다이얼로그 - AlertDialog 기반, confirm/cancel 콜백 |
| `cover-image-modal.tsx` | 커버 이미지 업로드 모달 - SingleImageDropzone 통합 |
| `permissions-modal.tsx` | 문서 권한 관리 - 유저 검색, 역할 선택 (admin/editor/viewer), CRUD |
| `move-modal.tsx` | 문서 이동 CommandDialog - 상위 폴더 선택 또는 루트 이동 |
| `members-modal.tsx` | 워크스페이스 멤버 관리 - 초대 링크, 역할 변경, 활성화/비활성화 |
| `settings-modal.tsx` | 설정 다이얼로그 - 테마 토글, 채팅 언어 선택 |

## For AI Agents

### Working In This Directory
- 모달 열기/닫기 상태는 Zustand store 훅으로 관리 (`usePermissionsModal`, `useMembersModal`, `useMoveModal`)
- `ModalProvider`(`components/providers/modal-provider.tsx`)에서 모든 모달을 마운트
- 새 모달 추가 시 `modal-provider.tsx`에도 등록 필요

### Common Patterns
- Radix UI `Dialog`/`AlertDialog` 프리미티브 사용
- Zustand store: `isOpen`, `onOpen(data)`, `onClose()` 패턴
- 데이터 mutation: React Query `useMutation` + 성공 시 캐시 무효화

<!-- MANUAL: -->
