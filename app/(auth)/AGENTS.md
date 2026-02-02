<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-02 | Updated: 2026-02-02 -->

# (auth)

## Purpose
인증 관련 페이지 라우트 그룹. 로그인, 회원가입, 초대 수락 페이지.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | 중앙 정렬 flex 레이아웃 |
| `login/page.tsx` | 로그인 폼 - 이메일/비밀번호 + 선택적 Okta SSO 버튼 |
| `register/page.tsx` | 회원가입 폼 - 이름/이메일/비밀번호 |
| `invite/[token]/page.tsx` | 초대 수락 페이지 - 비동기 토큰 처리 |

## For AI Agents

### Working In This Directory
- 모든 페이지 컴포넌트는 "use client" 디렉티브 사용
- 로그인은 `next-auth/react`의 `signIn()` 호출
- Okta 버튼은 `AUTH_OKTA_ISSUER` 환경변수 존재 시에만 렌더링
- 초대 수락은 `hooks/use-members.ts`의 `useAcceptInvitation()` 사용

<!-- MANUAL: -->
