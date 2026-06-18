# Find Feature Location

Locate where a feature, component, or service is implemented in the eagle-fusion monorepo.

**Usage:** `/find-feature <thing-to-find>`

Examples:
- `/find-feature quiz viewer`
- `/find-feature search autocomplete`
- `/find-feature org course list`

---

Search the codebase for the described feature. Use Grep and Glob to find:

1. The component or service that implements it
2. The routing module that declares its route
3. The NgModule that declares it
4. Any related API calls it makes

Report back with:
- Exact file paths (clickable)
- The relevant class/function names
- The route URL if it's a routed feature
- Which library or feature module it belongs to (`src/app/`, `project/ws/app/`, `library/ws-widget/`)
