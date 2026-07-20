# Hypora Release 2.0.3

- **Version:** 2.0.3
- **Branch:** `feature/progressive-navigation`
- **Release Date:** 2026-07-21
- **Author:** rwkim, with Claude Sonnet 5 (AI engineering assistant)
- **Deployed to:** [https://hypora-2026.vercel.app](https://hypora-2026.vercel.app) (production, Vercel project `ttuis-projects/app`)

**Summary:** Redesigns Hypora's project navigation so the current page, completed steps, the recommended next step, optional tools, and the project overview are all distinguishable at a glance — without relying on color alone.

---

## Overview

Hypora's project navigation previously showed the current page and the suggested next step in the same blue text, distinguished only by whether the item was underlined. In practice this made it hard to tell, at a glance, "where am I" from "what should I do next" — especially for first-time users trying to understand what a new, mostly-empty project's workflow actually looks like.

This release replaces that single-signal treatment with a navigation model — internally called **Concept G**, the result of a structured design comparison across seven candidate treatments — that communicates five distinct states (current, completed, next-recommended, available, optional) through a combination of grouping, weight, icons, and a dedicated color role, never color by itself. It reuses the project's existing progress data end-to-end; no new tracking or state was introduced to make this possible.

## What's Changed (Technical)

**Navigation**
- Current page now combines three signals at once (bold weight, underline, accent color) instead of relying on color alone.
- Completed required stages (Idea, First Version, Testing) show an explicit check indicator, independent of whether that stage is also the current page — revisiting a finished stage now correctly shows both "you're here" and "this is done" simultaneously, instead of one hiding the other.
- The recommended next step is now shown for *any* of the three required stages (previously this emphasis only ever applied to the very first stage), using a distinct badge and color so it can never be mistaken for the current page.
- When the recommended next step and the current page are the same item, the "next" badge is suppressed there — showing both at once was redundant, not clarifying.
- Once every required stage is complete, no item is ever shown as "next" — no misleading suggestion after there's nothing left to suggest.
- Required stages are now visually grouped together; the optional Risk tool and the always-available Overview are visually separated from that group and from each other.

**UI / UX**
- The optional Risk item is styled as a distinct pill with an "Optional" tag, never presented as if it were a required step.
- Overview no longer reads as a numbered workflow step — it sits past a visual divider as a plain, always-reachable destination.
- Long project titles (including long Korean titles) now wrap instead of overflowing or breaking the header layout.
- Nothing about route access changed — every navigation item was, and remains, clickable at every project stage.

**Design System**
- Added a new `info` tone to the shared Status Badge component, specifically for forward-pointing, non-alarming suggestions. The existing `warning` tone was deliberately not reused for this, since it would risk making a normal "here's what's next" suggestion read as a problem.
- Added a corresponding `--color-info` design token (light and dark variants).
- Added a generic, reusable "visually hidden but screen-reader-readable" text utility — the first of its kind in the codebase.

**Accessibility**
- Exactly one navigation item is ever marked as the current page for assistive technology (`aria-current`).
- Completed status has real text for screen readers, not just an icon — a screen reader user gets the same information a sighted user gets from the checkmark.
- All decorative icons are hidden from assistive technology so they're never announced as if they were content.
- Every navigation item remains a real, focusable, keyboard-activatable control — nothing is presented as disabled.
- Reduced-motion preferences are respected; navigation state changes are not animation-dependent.

**Specifications**
- See Specification Updates below.

**Tests**
- A new automated check suite verifies the logic deciding which stage is "completed" and which is "next," directly against the project's existing progress data — including the case where a stage is both the current page and already completed.

## Specification Updates

- **New ADR-0022** ("Generalize Navigation Emphasis to All Required Workflow Stages, Add Completion Indicators") — records the decision to extend next-step emphasis beyond the first workflow stage and to add completion indicators, reusing existing progress-tracking logic rather than introducing anything new. This was necessary because the prior architecture decision (ADR-0020) had deliberately limited emphasis to only the first stage and explicitly flagged this exact extension as something that would need its own decision later — this release is that decision.
- **ADR-0020 updated** with a note recording that its scope was partially extended by ADR-0022, without altering ADR-0020's original decision record.
- **Workspace Architecture spec updated** with a new section defining the navigation roles (required stage / optional tool / summary), the visual states (current / completed / next / available), which combinations of those are valid, and exactly which existing project data each state is derived from — so a future change to this behavior has one clear place to check.
- **Design System spec updated** to document the new badge tone and token, and why the existing "warning" tone wasn't reused for this purpose.

These were necessary so that the actual behavior now matches what's written down — before this release, the specification only described emphasis for the very first workflow stage, while the new behavior (and the underlying product need) had already outgrown that description.

## User-Facing Improvements (한국어)

✨ 프로젝트 진행 흐름이 더욱 직관적으로 개선되었습니다.

이제 현재 작업 중인 단계와
다음에 진행해야 할 단계를
더 쉽게 구분할 수 있습니다.

완료한 단계는 체크 표시로 명확하게 나타나며,
이미 끝낸 단계를 다시 열어봐도
완료 상태가 그대로 유지되어 혼란이 없습니다.

리스크 같은 선택 기능은 필수 진행 단계와
시각적으로 구분되어 있어,
무엇을 꼭 해야 하고 무엇이 선택인지
헷갈리지 않습니다.

개요 페이지는 진행 단계가 아니라
언제든 확인할 수 있는 요약 화면으로
자연스럽게 자리 잡았습니다.

모든 단계는 이전과 마찬가지로 자유롭게
이동할 수 있으며, 순서가 강제되지 않습니다.

## Before / After

| Before | After |
|---|---|
| 현재 페이지와 다음 추천 단계가 같은 파란색으로 표시되어 구분이 어려움 | 현재 페이지는 굵은 글씨·밑줄·강조 색이 함께 적용되고, 다음 단계는 전혀 다른 색과 배지로 표시되어 한눈에 구분됨 |
| 완료한 단계를 다시 열면 완료 표시가 사라짐 | 완료한 단계를 다시 열어도 완료 표시가 그대로 유지됨 |
| "다음 추천" 표시가 첫 번째 단계에만 적용됨 | 세 가지 필수 단계 모두에서 다음 추천 단계를 확인할 수 있음 |
| 리스크·개요가 필수 단계와 시각적으로 동일하게 나열됨 | 리스크는 "선택" 표시로, 개요는 별도 구역으로 분리되어 표시됨 |
| 상태 구분이 색상 하나에만 의존함 | 아이콘·굵기·배지·그룹핑을 함께 사용해 색약 사용자도 상태를 구분할 수 있음 |

## Validation Summary

All validations below were actually executed as part of this release, not assumed:

- **Build:** `npm run build` — clean production build, no errors.
- **Type check:** `npm run typecheck` — clean.
- **Lint:** `npm run lint` — no new warnings (2 pre-existing, unrelated warnings only).
- **Automated logic tests:** `npm run verify:domain-navigation` (new) plus the full existing verify suite (`verify:stage1`, `verify:stage2`, `verify:stage3`, `verify:stage6`, `verify:stage7`, `verify:domain-summary`) — all pass.
- **Browser validation:** 33 automated browser checks across 8 required scenarios (new project, a completed stage, revisiting a completed stage, viewing the optional tool, viewing the overview, every required stage complete, partial/incomplete data, a pre-existing project with no navigation-specific data) — all pass.
- **Accessibility checks:** single current-page marker, screen-reader text for completed status, decorative icons hidden from assistive technology, full keyboard focusability, no disabled/inaccessible items, reduced-motion behavior confirmed.
- **Responsive verification:** checked at wide desktop, laptop, tablet, and narrow mobile widths, including a long Korean project title and 140% browser text size, with no horizontal overflow.
- **Regression verification:** language switching, browser back/forward, and direct URL access to every project route confirmed working; production smoke-checked post-deploy (`/`, `/app`, `/api/health` all responding normally, no errors in deployment logs).

## Breaking Changes

**No breaking changes.**

- No route was removed, renamed, or made inaccessible.
- No existing data field was changed or removed.
- No API contract changed.
- No migration is required for existing projects — a project created before this release displays correctly with no special handling.

## Known Limitations

- A manually corrupted local project record (missing its core data entirely) can still cause an unrelated, pre-existing page to fail to render. This was found during testing, is not caused by this release, and is not reachable through any normal use of the app — it was not fixed here because it falls outside this release's scope.
- The new "next step" color has not yet been validated with real users — automated and manual checks found no issues, but this is a genuinely new visual signal worth a quick look with real users before relying on it further.

## Files Modified

- **Navigation logic:** a new, pure module deriving which stage is completed and which is recommended next, directly from existing project progress data.
- **Navigation UI:** the project header/navigation component and its stylesheet.
- **Design system:** the shared status badge component and the shared color tokens.
- **Localization:** English and Korean text resources, for the new status labels.
- **Specifications:** one new architecture decision record, one existing decision record annotated (not rewritten), and the Workspace and Design System specifications.
- **Tests:** one new automated verification script.

## Release Highlights

### English

- Current page and next-recommended step are now visually distinct — no more relying on the same shade of blue for both.
- Completed workflow steps show a clear checkmark, even when you're revisiting them.
- The recommended next step is now shown across the whole required workflow, not just the very first step.
- Optional tools (Risk) and the always-available Overview are now clearly set apart from the required steps.
- Every step remains freely reachable in any order — this release changes how state is *shown*, not what you're allowed to *do*.
- Built entirely on the app's existing progress-tracking data — no new fields, no migration needed.
- Verified across desktop, tablet, and mobile, with keyboard and screen-reader support.
- Deployed to production with no breaking changes.

### 한국어

- 현재 페이지와 다음 추천 단계를 이제 명확하게 구분할 수 있습니다.
- 완료한 단계는 다시 방문해도 완료 표시가 그대로 유지됩니다.
- 다음 추천 단계 표시가 모든 필수 단계에서 제공됩니다.
- 리스크(선택 기능)와 개요(요약 화면)가 필수 진행 단계와 명확히 구분됩니다.
- 모든 단계는 이전처럼 순서에 상관없이 자유롭게 이동할 수 있습니다.
- 기존 데이터를 그대로 활용해 별도의 데이터 이전 없이 적용되었습니다.
- 데스크톱·태블릿·모바일과 키보드·스크린리더 환경에서 확인을 마쳤습니다.
- 별도의 호환성 문제 없이 실제 서비스에 배포되었습니다.
