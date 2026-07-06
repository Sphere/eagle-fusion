# Create New Angular Component

Create a new Angular component in this project following all conventions.

**Usage:** `/new-component <name> [feature-module-path]`

Example: `/new-component course-card project/ws/app/src/lib/routes/search`

---

You are creating a new Angular component in the eagle-fusion monorepo. Follow these rules exactly:

1. **Selector:** `ws-app-<kebab-name>`
2. **Standalone:** always `false` (NgModule project)
3. **No semicolons**, single quotes, 2-space indent
4. **SCSS imports:** always start with `@import 'ws-vars'; @import 'ws-mixins'; @import 'ws-common';`
5. **Strings:** wrap all user-visible text in `{{ 'KEY' | translate }}`
6. **trackBy:** add for any `@for` / `*ngFor` over non-trivial lists
7. **Mobile:** if the component renders content cards, implement both desktop (`ws-app-learning-card`) and mobile (`ws-mobile-course-view`) variants controlled by `valueSvc.isXSmall$`
8. **Logger:** inject `LoggerService` instead of using `console.log`
9. **Register** the component in the nearest feature module's `declarations[]`

Generate:
- `<name>.component.ts`
- `<name>.component.html`
- `<name>.component.scss`

Then show which module file needs updating and what line to add.
