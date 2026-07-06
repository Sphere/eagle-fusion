# Scaffold New Feature Module

Scaffold a complete Angular feature module in eagle-fusion following project conventions.

**Usage:** `/new-feature-module <module-name> [parent-path]`

Example: `/new-feature-module notifications project/ws/app/src/lib/routes`

---

Create a new lazy-loaded feature module. Generate:

1. `<name>.module.ts` — NgModule with CommonModule, RouterModule, MatModule imports as needed
2. `<name>-routing.module.ts` — RouterModule.forChild() with a default route
3. `components/<name>/<name>.component.ts` — Root component (selector: `ws-app-<name>`)
4. `components/<name>/<name>.component.html` — Basic template with translate pipe
5. `components/<name>/<name>.component.scss` — With ws-vars/mixins/common imports

Then show what to add to the **parent routing module** to lazy-load this new module:
```ts
{
  path: '<name>',
  loadChildren: () => import('./<name>/<name>.module').then(m => m.<Name>Module)
}
```

Follow all conventions: no semicolons, single quotes, 2-space indent, `standalone: false`, selector prefix `ws-app-`.
