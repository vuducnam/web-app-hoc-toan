# Brainstorm — Exercise Generation: Root Cause & Roadmap

**Date:** 2026-04-25 11:13
**Trigger:** User report: "chưa có bài tập được tạo ra"
**Outcome:** Identified 3 bugs blocking exercise rendering + drafted Phase 13 content roadmap

## Problem Statement

User clicks skill on `/student/topic/[id]` → practice page `/student/practice/[skillKey]` shows blank/placeholder, never renders real question. Despite codebase claiming "10 live + 19 stub generators", 100% of skills fall through to "🚧 Bài đang được chuẩn bị" placeholder.

## Investigation Summary

### Project state (verified)

- DB seeded: 2 grades, 4 volumes, 25 topics, 56 lessons, **60 skills**, 2 users
- Skill split: **44 use `generatorKey`**, 16 use `poolKey`
- Generator registry: **10 live + 19 stub keys**

### Cross-check `Skill.generatorKey` (44 distinct in DB) vs registry

| Bucket | Count | Examples |
|---|---|---|
| Match LIVE generator | **10** | add-sub-100k-carry, multiply-2-digit, fraction-add, decimal-add, percent-of-whole, ... |
| Match STUB generator | **6** | decimal-subtract, decimal-divide, decimal-compare, fraction-multiply, fraction-divide, fraction-compare |
| **Unknown** (no entry in registry) | **28** | numbers-to-100k, even-odd, length-conversion, mass-conversion, capacity-conversion, rounding, multiply-1-digit, divide-1-digit, fraction-concept, decimal-concept, ... |

## Root Cause: 3 Layered Bugs

### Bug #1 (CRITICAL) — Sai key dùng để lookup generator

3 chỗ dùng URL skillKey (= `Skill.key` ví dụ `g4-add-sub-100k-carry`) thay vì `Skill.generatorKey` (= `add-sub-100k-carry`):

- `src/app/actions/practice.ts:63`
- `src/app/actions/practice-submit-core.ts:55`
- `src/app/actions/practice-client-actions.ts:26`

→ `getGenerator("g4-...")` luôn throw `"Unknown generator: g4-..."` → catch → return `{ error: "stub" }` → page render placeholder cho 100% skills.

**Hệ quả:** Bug #1 một mình đã đủ gây ra triệu chứng. Cả 10 live generators bị block.

### Bug #2 (MAJOR) — generatorKey mismatch giữa seed và registry

28/44 DB generatorKey không có cả live lẫn stub trong registry. Thậm chí có cặp keys "gần như đúng":
- Seed `length-conversion` ↔ Registry `convert-units-length`
- Seed `rounding` ↔ Registry `round-to-nearest-10k`
- Seed `multiply-divide-powers-10` ↔ Registry `multiply-by-10-100-1000`

→ Sau fix Bug #1, 28 skills này vẫn fall through về placeholder (acceptable nếu intent là stub, nhưng key naming inconsistent là technical debt).

### Bug #3 (MAJOR) — poolKey skills không có code path

Schema cho phép skill dùng `poolKey` (XOR `generatorKey`); 16 skills DB dùng poolKey (vd `g4-angle-measure`). `practice.ts` chỉ gọi `getGenerator()` — không có nhánh xử lý poolKey, không có pool registry. → 16 skill này luôn lỗi.

## Recommended Fixes (Brutally Honest, KISS-first)

### Phase A — Unblock 10 live generators (15 min, CRITICAL)

Sửa 3 chỗ:
```ts
// practice.ts (RSC) — đã load skill từ DB
const generator = getGenerator(skill.generatorKey!);

// practice-submit-core.ts & practice-client-actions.ts — cần load skill
const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
if (!skill?.generatorKey) return { error: "stub", message: "..." };
const generator = getGenerator(skill.generatorKey);
```

Add: pre-check `skill.generatorKey` null guard (poolKey path). Return placeholder cleanly, không crash.

### Phase B — Naming convention reconcile (defer, low priority)

2 lựa chọn:
- **B1** (clean): Rename seed `generatorKey` để match registry (`length-conversion` → `convert-units-length`). Cần migration nếu có user data; an toàn nếu pre-launch.
- **B2** (lazy/safe): Bổ sung 28 unknown keys vào `STUB_KEYS` để không "Unknown generator" — chỉ "NotImplemented" (placeholder hiện đẹp hơn, tracking rõ hơn). KISS.

→ **Recommended: B2** — KISS, không động DB.

### Phase C — poolKey graceful fallback (defer)

Phase 13 mới làm pool. Trước mắt: thêm guard `if (!skill.generatorKey) return { error: "stub" }` để không crash; behavior identical to stub.

### Phase D — Smoke test sau fix

- Login student (PIN dev account)
- Click 10 live skill keys → expect render question card
- Click bất kỳ stub/unknown/poolKey skill → expect placeholder

## Phase 13 Content Roadmap (Implement remaining generators)

### Scope analysis (44 generatorKey skills)

| Cluster | Skills cần implement | Độ khó (dev effort) |
|---|---|---|
| Number sense G4 | numbers-to-100k, even-odd, 6-digit-numbers, place-value-6digit, rounding | Easy (RNG digit ops) |
| Big arithmetic G4 | add-large-numbers, sub-large-numbers, multiply-1-digit, divide-1-digit, multiply-divide-powers-10 | Easy-Medium |
| Unit conversion G4 | length-conversion, mass-conversion, capacity-conversion | Medium (table-driven) |
| Fraction concept G4 | fraction-concept | Medium (visual?) |
| Decimal G5 | decimal-concept, decimal-rounding, decimal-subtract, decimal-divide, decimal-compare, decimal-powers-10 | Medium |
| Fraction G5 | fraction-multiply, fraction-divide, fraction-compare, fractions-review | Medium |
| Geometry G5 | area-unit-conversion, volume-units, rectangular-prism-volume, time-measurement | Medium-Hard (formula-based) |
| Reviews | natural-numbers-review, semester1-review-arithmetic, semester1-review-decimals, year-review-arithmetic, year-review-fractions, year-review-comprehensive | Hard (composition of multiple skills, MC format?) |

### Recommended priority

1. **Tier 1 (unlock G4 dashboard, ~10 generators):** Number sense + big arithmetic — simple RNG patterns, fast wins
2. **Tier 2 (unlock G5 dashboard, ~8 generators):** Decimal + fraction extension (subtract/divide/compare/multiply)
3. **Tier 3 (geometry + units, ~6 generators):** Area, volume, time, length/mass/capacity
4. **Tier 4 (reviews, 6 generators):** Composition pattern — pull random from already-implemented generators
5. **Tier 5 (poolKey design, 16 skills):** Defer — design pool architecture (probably static problem bank for word problems / angles / IQ)

### Levels strategy (decided): Giữ 3 levels D1/D2/D3

User confirmed: KISS, không thêm tier 4 "Nâng cao". Nếu cần advanced → tách thành skill riêng (vd `fraction-divide-advanced`) thay vì thêm difficulty tier — preserves state machine, generator interface, UI.

## Success Metrics

**Phase A (post-fix):**
- 10/60 skills render real questions (16.6%) ✅
- 0 crashes on remaining 50 skills ✅
- All e2e click-skill paths terminate gracefully ✅

**Phase 13 (full content):**
- 44/60 generatorKey skills live (73%)
- 16 poolKey skills designed + 5+ implemented
- Per generator: ≥1 unit test asserting (seed → identical question)
- Coverage maintained ≥90%

## Risks

| Risk | Mitigation |
|---|---|
| Fix Bug #1 reveals secondary bugs (rate limit, session, etc) | Smoke test all 10 live skills, not just one |
| Phase 13 timeline blow-out (28 generators) | Tier-by-tier delivery; each tier independently shippable |
| Naming reconcile (Bug #2 B1 path) breaks existing user progress | Defer B1; pick B2 catch-all stubs instead |
| poolKey design ambiguity | Treat poolKey as separate Phase 14 effort; out of Phase 13 scope |

## Decisions Locked In

- ✅ Generation strategy: **Procedural only** (not hybrid, not static bank)
- ✅ Difficulty levels: **3 (D1/D2/D3)** — no 4th tier; advanced content as separate skills
- ✅ Fix order: A → D first; B2 + C as cleanup; Phase 13 as new effort
- ✅ MVP definition for Phase A: 10 live generators rendering questions; rest placeholder

## Next Steps

1. Apply Bug #1 fix (Phase A) — 15 min
2. Smoke test 10 live skills end-to-end
3. Apply Bug #2 (B2) + Bug #3 graceful guard — 30 min
4. Run unit + integration tests
5. Invoke `/ck:plan` for Phase 13 (28 new generators in 4 tiers)
6. Update `docs/project-changelog.md` with Phase 12.5 (bugfix release)

## Unresolved Questions

- Có cần migration cho `Skill.generatorKey` rename (B1 path) không? → Phụ thuộc launch status. Nếu chưa user thật → B1 OK, ngược lại B2.
- poolKey architecture: static JSON pool, DB pool table, hay LLM-generated cache? → Defer Phase 14 brainstorm.
- "Reviews" generators (semester/year-review): tự compose từ generator khác hay viết riêng? → Recommended: composition wrapper.
- Cần seed dev SkillProgress data để test "Continue" CTA + decay rules không? → Tách riêng test fixtures task.
