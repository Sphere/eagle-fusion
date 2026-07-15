# Phase 2: Extended Coverage — In Progress 🔄

**Start Date:** 2026-07-14  
**Target Issues:** 300-400 additional fixes  
**Scope:** library/ws-widget + project/ws + extended src/app  
**Expected Duration:** 1-2 sessions

---

## Overview

Phase 2 expands the code quality improvements beyond the top 10 critical files to cover library and feature modules, with focus on:
1. Type safety (replace 'any' with proper types)
2. Dead code removal (additional commented code)
3. Readonly safety (more constructor parameters)
4. Error handling standardization

---

## Target Issues by Category

### Category 1: Type 'any' Replacement ⭐ HIGH PRIORITY
**Impact:** 902 instances across codebase  
**Current Status:** Not started

#### Top Files Requiring Type Replacements:
| File | Count | Priority |
|------|-------|----------|
| mobile-profile-dashboard.component.ts | 42 | HIGH |
| mobile-dashboard.service.ts | 36 | HIGH |
| root.component.ts | 35 | HIGH |
| web-public-container.component.ts | 32 | HIGH |
| personal-detail-edit.component.ts | 32 | HIGH |
| General parameter types | 250+ | MEDIUM |

#### How to Fix 'any' Types

**Pattern:**
```typescript
// ❌ Before
function processData(data: any) {
  return data.identifier
}

// ✅ After
interface DataModel {
  identifier: string
  // other properties
}
function processData(data: DataModel) {
  return data.identifier
}
```

**Strategy:**
1. Analyze usage context (where is the any used?)
2. Create or find existing interface (check src/app/models/)
3. Apply the interface type
4. Run `yarn run lint` to verify
5. Run tests to ensure no breaking changes

#### Existing Interfaces to Reuse:
```
src/app/models/
  - user.model.ts (user data types)
  - course.model.ts (course data types)
  - content.model.ts (content metadata)
```

#### Creating New Interfaces (Example):
```typescript
// In src/app/models/dashboard.model.ts
export interface ProfileDashboardData {
  userId: string
  userName: string
  profileImageUrl: string
  enrolledCourses: Course[]
  completedCourses: Course[]
  // ... other fields
}

// Then use:
export class MobileProfileDashboardComponent {
  dashboardData: ProfileDashboardData  // Instead of 'any'
}
```

---

### Category 2: Additional Commented Code Removal ✂️ HIGH PRIORITY
**Total Lines:** 1,026+ across library/ws-widget  
**Current Status:** Not started

#### Files with Significant Commented Code:
| File | Lines | Type |
|------|-------|------|
| player-pdf.component.ts | 48 | Logic blocks |
| player-video.component.ts | 42 | Event handlers |
| telemetry.service.ts | 65 | API calls |
| search-filters.component.ts | 35 | Form setup |
| player-controls.component.ts | 28 | UI logic |

#### Decision Criteria:
✅ **Safe to Remove:**
- Entire functions commented (>5 lines)
- Deprecated API calls
- Alternative implementations (when active code exists)
- Debug/logging statements
- Commented imports with no active reference

❌ **Keep for Now:**
- Short comments (<3 lines) without clear supersession
- Platform-specific workarounds
- Code with recent commit dates
- Anything with adjacent TODO comment

#### Removal Pattern:
```typescript
// ❌ Before: 28 lines of commented code
/*
  Old implementation details...
  - Authentication flow
  - Token refresh
  - Error handling
  All replaced by modern service
*/

// ✅ After: Removed entirely
// Comment added to commit message documenting removal
```

---

### Category 3: Readonly Modifiers — Extended Coverage 🔒 HIGH PRIORITY
**Remaining Instances:** 468  
**Current Status:** Phase 1 completed 126+

#### Files to Update:
| File | Params | Priority |
|------|--------|----------|
| app.component.ts | 14 | HIGH |
| app-nav-bar.component.ts | 12 | HIGH |
| bnrc-register.component.ts | 13 | HIGH |
| user-profile.component.ts | 18 | HIGH |
| search.component.ts | 11 | HIGH |

#### Pattern (Same as Phase 1):
```typescript
// ❌ Before
constructor(
  private service: MyService,
  private router: Router
) { }

// ✅ After
constructor(
  private readonly service: MyService,
  private readonly router: Router
) { }
```

#### Automation Hint:
Can use ESLint --fix on prefer-readonly rule:
```bash
yarn run lint --fix  # May auto-fix some readonly issues
```

---

### Category 4: Error Handling Standardization 🛡️ MEDIUM PRIORITY
**Remaining Blocks:** 85+ catch blocks  
**Current Status:** 7 fixed in Phase 1

#### Pattern to Standardize:
```typescript
// ❌ Bad: Empty catch
catch (error) { }

// ❌ Bad: Only console
catch (error) { console.error(error) }

// ✅ Good: Proper logging
catch (error) {
  this.logger.error('Context-specific message:', error)
  // Optional: throw or return fallback
}
```

#### Files with Most Empty Catch Blocks:
| File | Count | Priority |
|------|-------|----------|
| service-collection.service.ts | 12 | MEDIUM |
| data-loader.service.ts | 9 | MEDIUM |
| api-interceptor.service.ts | 7 | MEDIUM |
| cache-service.ts | 6 | MEDIUM |

#### Implementation:
1. Find empty catch blocks: `grep -n "catch" src/app/**/*.ts`
2. Add logger.error with context
3. Verify test coverage for error paths
4. Check if error should be re-thrown

---

## Implementation Strategy

### Phase 2A: Type Replacements (Week 1)
**Target:** 450+ 'any' instances → proper interfaces  
**Agent Assignment:** 4-6 parallel agents per high-impact file  
**Verification:** ESLint, tsc, Jest

### Phase 2B: Code Cleanup (Week 1)
**Target:** 1,026 commented lines removed  
**Agent Assignment:** 2 parallel agents on library/ws-widget  
**Verification:** Build test, Jest, SonarQube

### Phase 2C: Readonly & Error Handling (Week 2)
**Target:** 468 readonly + 85+ catch blocks  
**Agent Assignment:** 2-3 parallel agents  
**Verification:** ESLint, Jest

---

## File-by-File Priority Queue

### Tier 1: Critical (Start Here)
1. mobile-profile-dashboard.component.ts (42 'any' instances)
2. mobile-dashboard.service.ts (36 'any' instances)
3. root.component.ts (35 'any' instances)
4. player-pdf.component.ts (48 commented lines)
5. player-video.component.ts (42 commented lines)

### Tier 2: Important
6. web-public-container.component.ts (32 'any')
7. personal-detail-edit.component.ts (32 'any')
8. telemetry.service.ts (65 commented lines)
9. app.component.ts (14 readonly params)
10. search-filters.component.ts (35 commented lines)

### Tier 3: Good to Have
11-20: Files with 15-25 issues each
21+: Files with <15 issues each

---

## Testing & Verification

### Before Pushing Each File:
```bash
# 1. Lint specific file
yarn run lint fusion | grep "filename"

# 2. Run tests for that component
npx jest --testPathPattern="filename.spec.ts"

# 3. Type-check
npx tsc --noEmit

# 4. For service changes, run full suite
npx jest --roots '<rootDir>/src'
```

### Final Phase 2 Verification:
```bash
# 1. Lint everything
yarn run lint fusion

# 2. Full test suite
npx jest --roots '<rootDir>/src' --coverage

# 3. Build
yarn run build:local

# 4. Push to SonarQube
sonar-scanner -Dproject.settings=sonar-project.properties
```

---

## Expected Outcomes

| Metric | Phase 1 | Phase 2 | Total |
|--------|---------|---------|-------|
| Issues Fixed | 400 | 300-400 | 700-800 |
| Test Suites Passing | 127/127 | 127/127 | ✅ |
| Type Safety (any → typed) | 0 | 450+ | 450+ |
| Readonly Modifiers | 126+ | 300+ | 426+ |
| Commented Code Removed | 264 lines | 1,026 lines | 1,290 lines |
| Branch Coverage | 88% | 88-90% | 90%+ |

---

## When to Move to Phase 3

Phase 3 begins when:
- ✅ All Phase 2 Tier 1 files completed
- ✅ 300+ additional issues fixed
- ✅ All tests passing
- ✅ SonarQube analysis shows <2,500 issues in src/app
- ✅ Team agrees on priorities

Phase 3 targets: Remaining issues in library/ws-widget (1,454) and project/ws (3,052)

---

## Quick Reference: Common Fix Patterns

### Pattern 1: Replace 'any' with Interface
```typescript
// Find intersection of all uses
// Create interface with required properties
// Apply interface type
```

### Pattern 2: Remove Commented Code
```typescript
// Search for old comments or alternative implementations
// Verify active code replaces functionality
// Remove commented block
// Update commit message with context
```

### Pattern 3: Add Readonly to Constructor
```typescript
// Add 'readonly' keyword to each parameter
// Verify no reassignments in constructor
// Run tests
```

### Pattern 4: Fix Error Handling
```typescript
// Replace empty catch with logger.error
// Include context in error message
// Optionally re-throw critical errors
```

---

## Troubleshooting

### Issue: Type changes break compilation
**Solution:** Ensure interface matches all usage sites; may need union types

### Issue: Tests fail after code cleanup
**Solution:** Check if tests depend on commented code structure; update tests

### Issue: Build fails after type replacements
**Solution:** Run full build `yarn run build:local` to catch AOT issues

### Issue: SonarQube report doesn't update
**Solution:** Wait 2-3 minutes for server processing; check report URL in sonar-scanner output

---

## Progress Tracking

Update [PROGRESS_LOG.md](./PROGRESS_LOG.md) daily with:
- Files completed
- Issues fixed
- Test results
- Any blockers

See PROGRESS_LOG.md for session-by-session updates.
