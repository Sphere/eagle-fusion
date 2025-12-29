# Hindi Translation Issues - Hardcoded `/hi/` Routes instead of ngx-translate

## Summary

The codebase has multiple places where language detection and routing are done by checking for `/hi/` in the URL instead of using the proper ngx-translate mechanism. This creates technical debt and makes the code harder to maintain and extend to other languages.

---

## Files with Hardcoded `/hi/` Language Detection

### 1. **Location-based Language Detection** (Most Critical)

These files check `location.href.includes('/hi/')` instead of using the injected translate service:

#### app/component/app-nav-bar/app-nav-bar.component.ts

- **Lines 78, 178, 198**: Multiple occurrences of `location.href.includes('/hi/')`
- **Issue**: Uses URL inspection instead of TranslateService

#### library/ws-widget/collection/src/lib/btn-feature/btn-feature.component.ts

- **Lines 81, 89, 98, 104, 110, 117, 123, 130**: Multiple hardcoded `/hi/` checks
- **Lines 267**: Commented code still checking `/hi/`
- **Issue**: Checks location.href for language instead of using TranslateService.currentLanguage

#### library/ws-widget/collection/src/lib/\_services/widget-content.service.ts

- **Lines 333, 347**: URL contains check for `/hi/`
- **Issue**: Service logic depends on URL structure

#### project/ws/viewer/src/lib/routes/quiz/quiz.component.ts

- **Line 105**: `if (artifactUrl.includes('/hi/'))`
- **Issue**: Content URL checking for language prefix

#### project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component.ts

- **Line 93**: Complex language detection with `/hi/` fallback
- **Current code**: `location.href.includes('/hi/') === true ? 'hi' : 'en'`

#### project/ws/app/src/lib/routes/search/routes/home/home.component.ts

- **Line 116**: `location.href.includes('/hi/')` check for locale
- **Issue**: Uses URL to determine language instead of TranslateService

#### project/ws/app/src/lib/routes/org/components/org/org.component.ts

- **Line 325**: `location.href.includes('/hi/') === true ? 'hi' : 'en'`
- **Issue**: Hardcoded language detection in org component

#### project/ws/app/src/lib/routes/app-toc/components/assessment-detail/assessment-detail.component.ts

- **Line 55**: `if (artifactUrl.includes('/hi/'))`
- **Issue**: Assessment detail checks URL for language

#### project/ws/app/src/lib/routes/search/routes/learning/learning.component.ts

- **Line 801**: Commented out but still references `/hi/`
- **Issue**: Legacy code pattern

---

### 2. **Route Configuration with Hardcoded `/hi/` Path**

#### src/app/app-routing.module.ts

- **Line 405**: `{ path: 'hi/hi/page/home', redirectTo: 'hi/page/home', pathMatch: 'full' }`
- **Issue**: Hardcoded Hindi path with duplicate 'hi' - indicates routing structure complexity

---

## Current Problem Pattern

### Before (Current - Hardcoded):

```typescript
// Checking URL for language
const language = location.href.includes('/hi/') ? 'hi' : 'en'

// Or routing with hardcoded path
this.router.navigate(['/hi/page/home'])
```

### After (Recommended - Using ngx-translate):

```typescript
// Use injected service
const language = this.translateService.currentLanguage

// Or use route parameter with translate guard
this.router.navigate(['/page/home'], {
  queryParams: { lang: this.translateService.currentLanguage },
})
```

---

## Recommended Solutions

### 1. **Create a Language Service**

```typescript
// services/language.service.ts
import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {}

  getCurrentLanguage(): string {
    return this.translate.currentLanguage || this.translate.defaultLanguage
  }

  isHindi(): boolean {
    return this.getCurrentLanguage() === 'hi'
  }

  setLanguage(lang: string): void {
    this.translate.use(lang)
  }
}
```

### 2. **Replace URL-based Detection with Service Injection**

**Before:**

```typescript
if (window.location.href.includes('/hi/')) {
  // Do something for Hindi
}
```

**After:**

```typescript
constructor(private languageService: LanguageService) {}

if (this.languageService.isHindi()) {
  // Do something for Hindi
}
```

### 3. **Use Query Parameters Instead of URL Paths**

Instead of `/hi/page/home`, use `/page/home?lang=hi` and let ngx-translate handle it

### 4. **Create Translation Keys for Conditional Logic**

Instead of language-based conditions, use feature flags or translation keys:

```typescript
// In component
const isHindiSpecific = this.translateService.instant('FEATURE.IS_HINDI_SPECIFIC')
```

---

## Files Requiring Refactoring (Priority Order)

### HIGH PRIORITY (Direct Language Detection):

1. `src/app/component/app-nav-bar/app-nav-bar.component.ts`
2. `library/ws-widget/collection/src/lib/btn-feature/btn-feature.component.ts`
3. `project/ws/app/src/lib/routes/org/components/org/org.component.ts`

### MEDIUM PRIORITY (Service-level Changes):

4. `library/ws-widget/collection/src/lib/_services/widget-content.service.ts`
5. `project/ws/app/src/lib/routes/search/routes/home/home.component.ts`

### LOW PRIORITY (Content-based):

6. `project/ws/viewer/src/lib/routes/quiz/quiz.component.ts`
7. `project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component.ts`
8. `project/ws/app/src/lib/routes/app-toc/components/assessment-detail/assessment-detail.component.ts`

### ROUTING CONFIG:

9. `src/app/app-routing.module.ts` - Line 405

---

## Implementation Steps

1. **Create LanguageService** in `src/app/services/language.service.ts`
2. **Inject service** in all 8 high-priority components
3. **Replace URL checks** with service method calls
4. **Update tests** to mock LanguageService
5. **Migrate route config** to use query parameters
6. **Remove old `/hi/` URL detection code**
7. **Test with both EN and HI languages**

---

## Testing Checklist

- [ ] Navigation works in both English and Hindi
- [ ] Language switching doesn't require URL manipulation
- [ ] All conditional logic respects TranslateService.currentLanguage
- [ ] No hardcoded `/hi/` checks remain in new code
- [ ] Routing works without language prefix in URL
