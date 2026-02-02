<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# (public)

## Purpose
공개 문서 미리보기 라우트. 인증 없이 게시된 문서를 읽기 전용으로 볼 수 있음.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | 다크 배경 레이아웃 |
| `(routes)/preview/[documentId]/page.tsx` | 공개 문서 미리보기 - 읽기 전용 에디터 |

## For AI Agents

### Working In This Directory
- `isPublished === true` 인 문서만 접근 가능
- API: `GET /api/documents/public/[id]` 사용
- 에디터는 `editable: false` 모드

<!-- MANUAL: -->
