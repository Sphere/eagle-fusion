# Check Conventions

Review a file (or all changed files) for eagle-fusion convention violations before committing.

**Usage:** `/check-conventions [file-path]`

Examples:
- `/check-conventions` — checks all files modified in `git diff`
- `/check-conventions project/ws/app/src/lib/routes/search/search.component.ts`

---

Review the target file(s) and report every violation of these rules. Be specific: quote the offending line and state the fix.

## Checklist

### TypeScript
- [ ] No semicolons at end of statements
- [ ] Single quotes (not double quotes) for strings
- [ ] 2-space indent (no tabs, no 4-space)
- [ ] No `console.log` / `console.error` / `console.warn` — must use `LoggerService` or have `// eslint-disable-next-line no-console`
- [ ] Component decorator has `standalone: false`
- [ ] Component selector starts with `ws-app-` (directives use `ws` camelCase attribute)
- [ ] No `UntypedFormControl` — use typed `FormControl<T>`
- [ ] No hardcoded user-visible English strings — must come from i18n keys

### Templates
- [ ] All user-visible text uses `| translate` pipe
- [ ] Every `*ngFor` / `@for` over a non-trivial list has `trackBy` / `track`
- [ ] No inline styles (`style="..."`) — use CSS classes
- [ ] No hardcoded English strings

### SCSS
- [ ] File starts with `@import 'ws-vars'; @import 'ws-mixins'; @import 'ws-common';`
- [ ] Spacing uses `$size-*` variables, not raw px values for padding/margin
- [ ] Responsive breakpoints use `@include breakpoint-xs` / `breakpoint-s` / `breakpoint-gt-xs` mixins

### Imports
- [ ] Cross-library imports use path aliases (`@ws-widget/utils`, `@ws-widget/collection`) not relative `../../../../`
- [ ] New components are declared in their feature module's `declarations[]`

---

After listing all violations, show a summary count. If zero violations, confirm the file is clean.
