# Credentials & Security Setup Guide

**Last Updated:** 2026-07-14

## ⚠️ Security Incident Log

### 2026-07-14: SonarQube Credentials Exposure
- **Status:** MITIGATED
- **What Happened:** SonarQube admin credentials and analysis token visible in screenshot shared via documentation
- **Credentials Exposed:** 
  - Admin password: `Eagle@Sonar2026`
  - Analysis token: `sqa_5381b862cc14f72a18f27730497c7206c8079c70`
- **Action Taken:** 
  - ✅ Verified credentials NOT in codebase
  - ✅ Updated proxy config to use placeholder instead of hardcoded cookie
  - ✅ Created `.env.example` template
  - ⚠️ **REQUIRED: Rotate SonarQube credentials immediately**

---

## 1. SonarQube Credential Rotation

**If you shared the screenshot/link publicly, rotate credentials NOW:**

### Rotate Admin Password
1. Go to SonarQube: `http://localhost:9000`
2. Login as `admin` with current password
3. Click **Admin** → **Security** → **Users**
4. Find `admin` user → Click **Change password**
5. Set a strong new password (min 12 chars, mixed case + symbols)
6. **IMPORTANT:** Do NOT share the new password via screenshot or unencrypted channels

### Rotate Analysis Token
1. Go to SonarQube → **Administration** → **Security** → **Tokens**
2. Find your project token or global token
3. Click **Revoke** (delete old token)
4. Generate new token:
   ```bash
   sonar-scanner -Dsonar.token=<new-token>
   ```
5. Store token ONLY in:
   - Local `.env` file (NOT committed)
   - CI/CD secrets (GitHub Secrets, Jenkins credentials)
   - Password manager (1Password, LastPass, etc.)

---

## 2. Proxy Configuration (Dev Environment)

### Current Setup
**File:** `proxy/localhost.proxy.json`

The proxy includes a hardcoded `connect.sid` cookie for API authentication. This cookie:
- Expires periodically
- Should be replaced when it becomes invalid (server returns 419/403)

### How to Update the Cookie
When you see auth errors in dev:

1. Open DevTools → **Application** → **Cookies**
2. Find `sphere.aastrika.org` (or relevant domain)
3. Copy the `connect.sid` value
4. Edit `proxy/localhost.proxy.json` and replace the cookie in the `/apis/**` section:
   ```json
   "headers": {
     "Cookie": "connect.sid=<NEW_COOKIE_HERE>"
   }
   ```
5. Restart dev server: `yarn start`

### ⚠️ DO NOT Commit Cookie Changes
- The cookie changes frequently
- If you commit it, others will overwrite it
- Add `proxy/localhost.proxy.json` to `.gitignore` after setup (or document-only approach)

**Better Approach (TODO):**
Use a proxy middleware script that reads from `.env`:
```javascript
// proxy.middleware.js
module.exports = {
  '/apis/**': {
    target: 'https://sphere.aastrika.org/',
    headers: {
      Cookie: `connect.sid=${process.env.PROXY_COOKIE || ''}`
    }
  }
}
```

---

## 3. Environment Variables (`.env` file)

### Setup
1. Copy `.env.example` to `.env` (local only):
   ```bash
   cp .env.example .env
   ```

2. Fill in your local values:
   ```bash
   # .env (DO NOT COMMIT)
   PROXY_COOKIE=connect.sid=<your-session-cookie>
   SONAR_HOST_URL=http://localhost:9000
   SONAR_TOKEN=<your-analysis-token>
   SONAR_LOGIN=<your-password>
   ```

3. **Ensure `.env` is in `.gitignore`:**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

### Accessing Env Variables in Node Scripts
```javascript
require('dotenv').config()
const token = process.env.SONAR_TOKEN
```

---

## 4. SonarQube Scanner Command (Secure)

### ❌ NEVER DO THIS
```bash
# Bad — token visible in command history
sonar-scanner -Dsonar.token=sqa_5381b862cc14f72a18f27730497c7206c8079c70
```

### ✅ DO THIS INSTEAD
```bash
# Good — token from environment
export SONAR_TOKEN=<your-token>
sonar-scanner -Dsonar.token=$SONAR_TOKEN

# Or from .env
export $(grep -v '^#' .env | xargs)
sonar-scanner -Dsonar.token=$SONAR_TOKEN
```

---

## 5. CI/CD Secrets (GitHub Actions, Jenkins, etc.)

### GitHub Actions
```yaml
# .github/workflows/sonar.yml
- name: SonarQube Scan
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  run: |
    sonar-scanner -Dsonar.token=$SONAR_TOKEN
```

### Jenkins
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add **Secret text** credential named `sonar-token`
3. Use in pipeline:
   ```groovy
   withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
     sh 'sonar-scanner -Dsonar.token=$SONAR_TOKEN'
   }
   ```

---

## 6. Best Practices Checklist

- [ ] **Never commit credentials** (passwords, tokens, API keys)
- [ ] **Use `.env.example`** as a template for developers
- [ ] **Rotate tokens** if they're ever exposed (even in screenshots)
- [ ] **Use environment variables** in CI/CD pipelines, never hardcode
- [ ] **Audit git history** if credentials were accidentally committed:
  ```bash
  git log --all --full-history -- proxy/localhost.proxy.json
  git log -S "sqa_" --all --oneline  # Search for token patterns
  ```
- [ ] **Use `.gitignore`** for sensitive files:
  ```
  .env
  .env.local
  .env*.local
  .scannerwork/
  ```
- [ ] **Review proxy config** before pushing — ensure no real cookies/tokens
- [ ] **Change passwords regularly** (SonarQube, API services, etc.)
- [ ] **Use password manager** for team credential sharing (1Password, Vault, etc.)

---

## 7. Incident Response

If credentials are exposed:

1. **Immediately rotate them** in the source system
2. **Search git history** for accidental commits:
   ```bash
   git log --all --grep="token\|password\|credential" --oneline
   git log --all -S "your-token-here" --oneline
   ```
3. **Rewrite history if needed** (destructive, requires team coordination):
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all --tags
   ```
4. **Document the incident** for team awareness
5. **Update SonarQube configuration** if token was in project config
6. **Audit access logs** to detect unauthorized access

---

## 8. Quick Reference

| Item | Location | Type | Rotation Frequency |
|------|----------|------|-------------------|
| SonarQube admin password | SonarQube UI | Local only | Quarterly or after exposure |
| SonarQube analysis token | `.env` or CI/CD secrets | Sensitive | When exposed; otherwise yearly |
| Proxy API cookie | `proxy/localhost.proxy.json` | Dev only | When auth fails (419/403 errors) |
| API keys (other services) | CI/CD secrets, `.env` | Sensitive | Per service policy; typically yearly |

---

**Questions?** Contact the DevOps team or refer to the SonarQube documentation at https://docs.sonarqube.org/latest/user-guide/user-account/generating-and-using-tokens/
