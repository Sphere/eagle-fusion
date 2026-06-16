# Add Translation Key

Add a new i18n key to all translation files in eagle-fusion.

**Usage:** `/add-translation <KEY> "<English text>" ["<Hindi text>"]`

Examples:
- `/add-translation ENROLL_NOW "Enroll Now"`
- `/add-translation COURSE_COMPLETED "Course Completed" "पाठ्यक्रम पूरा हुआ"`

---

## Steps

1. **Check for duplicates** — Search `src/assets/i18n/en.json` for the key first. If it exists, report the current value and stop.

2. **Determine placement** — Find nearby alphabetically sorted keys in `en.json` and insert at the correct position (keys are not strictly sorted, so insert near thematically related keys instead).

3. **Update `src/assets/i18n/en.json`** — Add `"<KEY>": "<English text>"`.

4. **Update `src/assets/i18n/hi.json`** — Add `"<KEY>": "<Hindi text>"`. If no Hindi text was provided, use the English text as a placeholder and add a comment `// TODO: translate` inline (not valid JSON, so instead leave a note to the user).

5. **Show the template usage** — Print the line to use in a template:
   ```html
   {{ '<KEY>' | translate }}
   ```
   Or for an attribute:
   ```html
   [matTooltip]="'<KEY>' | translate"
   ```

## Key naming convention

The codebase mixes conventions. Match the nearest similar keys:
- Short labels: `SCREAMING_CASE` (e.g., `ENROLL_NOW`, `VIEW_COURSE`)
- Full sentences: use the sentence itself as key (e.g., `"Are you sure?"`)
- Form element labels: `FRMELEMNTS_LBL_<NAME>`

When in doubt, use `SCREAMING_CASE`.
