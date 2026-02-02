<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# db

## Purpose
Drizzle ORM 데이터베이스 클라이언트 초기화 및 PostgreSQL 스키마 정의.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Drizzle 클라이언트 생성 - `postgres()` + `drizzle()` 초기화, `db` export |
| `schema.ts` | 전체 DB 스키마 - 8개 테이블 정의 (users, documents, documentPermissions, chatRooms, chatRoomMembers, chatMessages, chatReactions, invitations) |

## For AI Agents

### Working In This Directory
- 스키마 변경 후 `npm run db:push` 로 DB에 반영 (Drizzle Kit)
- `schema.ts`의 테이블은 `pgTable()` 함수로 정의
- 관계(relations)는 외래키로 표현, Drizzle의 `eq()` 연산자 사용

### Schema Overview
- **users**: id, name, email, passwordHash, image, role(owner/admin/member), provider, isActive
- **documents**: id, title, content, coverImage, icon, isArchived, isPublished, isLocked, parentDocumentId(자기참조), userId
- **documentPermissions**: documentId + userId + role(admin/editor/viewer)
- **chatRooms**: id, type(page/direct), slug, name, documentId
- **chatRoomMembers**: roomId + userId, lastReadAt
- **chatMessages**: id, roomId, senderId, content, parentId(쓰레드), attachment
- **chatReactions**: messageId + userId + emoji
- **invitations**: id, token, email, role, expiresAt, acceptedAt

### Testing Requirements
- 스키마 변경 시 `npx tsc --noEmit` 으로 타입 호환성 확인
- DB 마이그레이션: `npm run db:generate` → `npm run db:push`

## Dependencies

### External
- `drizzle-orm` - ORM 프레임워크
- `postgres` - PostgreSQL 드라이버

<!-- MANUAL: -->
