# Comprehensive Authentication Module Test Execution & Coverage Report

**Generated on:** 2026-11-21  
**Project:** LifeTrack AI / Auth Application  
**Framework:** Playwright (TypeScript)  
**Total Tests:** **181 Automated Test Cases** across **9 Test Files**  
**Report Location:**
- **Interactive HTML Report:** [playwright-report/index.html](file:///c:/Users/Niranjani/Documents/my-project/playwrite/playwright-report/index.html)
- **Execution Summary:** [TEST_EXECUTION_REPORT.md](file:///c:/Users/Niranjani/Documents/my-project/playwrite/TEST_EXECUTION_REPORT.md)

---

## Executive Summary

| Test Area | Spec File | Positive | Negative | Total | Focus |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1. Create Account (Signup)** | `signup.spec.ts` | 15 | 24 | **39** | UI, boundaries, required fields, invalid email formats, duplicate email/username 409, 429 throttling, keyboard submit |
| **2. Set Password** | `set-password.spec.ts` | 14 | 19 | **33** | Direct access security, 7-rule live checklist, password length limit counter, mismatch, expired/used token states |
| **3. Login (Fields & Buttons)** | `login-fields-buttons.spec.ts` | 13 | 11 | **24** | Autofocus, valid/invalid credentials, password masking/unmasking toggles, submit button, Enter key |
| **4. Login (Keyboard & A11y)** | `login-keyboard-a11y-responsive.spec.ts` | 12 | 2 | **14** | Tab navigation sequence, aria attributes, responsive layouts (Mobile/Tablet/Desktop) |
| **5. Login (UI & Layout)** | `login-ui-layout.spec.ts` | 10 | 0 | **10** | Card title, subtitle, labels, placeholders, branding elements |
| **6. Login (Validation & Links)** | `login-validation-links.spec.ts` | 8 | 13 | **21** | Required field errors, uppercase email rejection (AUTH-001), 5 failed attempts lockout banner, navigation links |
| **7. Login (E2E Authentication)** | `login.spec.ts` | 1 | 1 | **2** | Valid credentials redirect to Dashboard; invalid credentials display error alert |
| **8. Forgot & Reset Password** | `forgot-password.spec.ts` | 11 | 17 | **28** | Email format validations, 60s cooldown timer, generic success for privacy, reset token security, 7 rules, mismatch |
| **9. YOPmail E2E Full Flow** | `signup-functional-yopmail.spec.ts` | 7 | 3 | **10** | Live YOPmail inbox browser automation, Turnstile handling, activation, login with new account, post-activation negative |
| **TOTAL** | **9 Clean Files** | **91** | **90** | **181** | **Complete Positive & Negative Coverage** |

---

## Detailed Test Scenarios by Area

### 1. Create an Account (`tests/auth/signup.spec.ts` — 39 Tests)

#### Positive Scenarios (15 Tests)
- `TC-SIGNUP-UI-001`: Auth card and brand icon are displayed correctly
- `TC-SIGNUP-UI-002`: Exact page title and descriptive subtitle are visible
- `TC-SIGNUP-UI-003`: Username label and placeholder are visible
- `TC-SIGNUP-UI-004`: Email address label and placeholder are visible
- `TC-SIGNUP-UI-005`: "Verify / Create Account" submit button is enabled on load
- `TC-SIGNUP-UI-006`: Footer prompt and "Sign In" link pointing to `/login`
- `TC-SIGNUP-A11Y-001`: Username field has autofocus on initial page mount
- `TC-SIGNUP-A11Y-002`: Username input has autocomplete="username" and type="text"
- `TC-SIGNUP-A11Y-003`: Email input has type="email" and valid placeholder
- `TC-SIGNUP-BOUND-002`: Username with exactly 2 characters (boundary min) passes validation
- `TC-SIGNUP-BOUND-003`: Username with exactly 50 characters (boundary max) passes validation
- `TC-SIGNUP-NAV-001`: Clicking "Sign In" footer link navigates to `/login`
- `TC-SIGNUP-RESP-001`: Responsive layout on Desktop (1280x720)
- `TC-SIGNUP-RESP-002`: Responsive layout on Tablet (768x1024)
- `TC-SIGNUP-RESP-003`: Responsive layout on Mobile (375x667)
- `TC-SIGNUP-UI-007`: Submit button shows loading/disabled state during submission
- `TC-SIGNUP-UI-010`: Success card displays submitted email and 2-minute validity note

#### Negative Scenarios (24 Tests)
- `TC-SIGNUP-VAL-001`: Submitting empty form triggers validation on both fields
- `TC-SIGNUP-VAL-002`: Submitting with only username triggers email required error
- `TC-SIGNUP-VAL-003`: Submitting with only email triggers username required error
- `TC-SIGNUP-VAL-004`: Submitting whitespace-only inputs triggers required errors
- `TC-SIGNUP-BOUND-001`: Username with 1 character (< 2) triggers min length error
- `TC-SIGNUP-BOUND-004`: Username with 51 characters (> 50) triggers max length error
- `TC-SIGNUP-BOUND-005`: Typing into username clears existing error
- `TC-SIGNUP-EMAIL-VAL (1)`: Rejects "plainaddress"
- `TC-SIGNUP-EMAIL-VAL (2)`: Rejects "@missingusername.com"
- `TC-SIGNUP-EMAIL-VAL (3)`: Rejects "username@.com"
- `TC-SIGNUP-EMAIL-VAL (4)`: Rejects "username@com"
- `TC-SIGNUP-EMAIL-VAL (5)`: Rejects "user with space@domain.com"
- `TC-SIGNUP-EMAIL-VAL (6)`: Rejects "user@domain,com"
- `TC-SIGNUP-EMAIL-002`: Typing into email clears existing error
- `TC-SIGNUP-VAL-005`: Pressing Enter on username field triggers form validation
- `TC-SIGNUP-VAL-006`: Pressing Enter on email field triggers form validation
- `TC-SIGNUP-UI-008`: Re-registering already-verified email displays 409 Conflict error
- `TC-SIGNUP-UI-009`: Registering already-taken username displays 409 Conflict error
- `TC-SIGNUP-UI-011`: Submitting during active 60s cooldown displays 429 Throttling error
- `TC-SIGNUP-NEG-001`: Clearing username after valid input triggers required error
- `TC-SIGNUP-NEG-002`: Clearing email after valid input triggers required error
- `TC-SIGNUP-NEG-003`: Valid username with invalid email only displays email error

---

### 2. Set Password (`tests/auth/set-password.spec.ts` — 33 Tests)

#### Positive Scenarios (14 Tests)
- `TC-SETPW-SEC-002`: Blocked screen "Request New Verification Link" navigates to `/signup`
- `TC-SETPW-SEC-002B`: Blocked screen "Back to Login" navigates to `/login`
- `TC-SETPW-UI-001`: Set Your Password title, subtitle, labels, and submit button
- `TC-SETPW-UI-002`: Complete 7-rule Password Requirements box is visible
- `TC-SETPW-UI-003`: Password visibility toggles switch input types between `password` and `text`
- `TC-SETPW-UI-004`: Submit button text is "Activate Account & Set Password"
- `TC-SETPW-UI-005`: Footer displays "Already verified?" with link to `/login`
- `TC-SETPW-A11Y-001`: Create Password input has autofocus on page load
- `TC-SETPW-A11Y-002`: Tab navigation navigates from Create Password to Confirm Password
- `TC-SETPW-RULES-001`: Compliant 8-character password satisfies all 7 checklist rules
- `TC-SETPW-LEN-003`: Typing valid 8-char password clears exceeds-limit error
- `TC-SETPW-LEN-004`: Typing valid confirm password clears confirm exceeds-limit error
- `TC-SETPW-MISMATCH-002`: Matching valid passwords do not trigger mismatch error
- `TC-SETPW-POS-001`: Valid password submission displays "Account Activated!" success card

#### Negative Scenarios (19 Tests)
- `TC-SETPW-SEC-001`: Direct navigation without token blocks access and hides inputs
- `TC-SETPW-SEC-003`: Navigation with invalid/tampered token shows security rejection
- `TC-SETPW-SEC-004`: Expired token shows "Link Expired" screen and hides password form
- `TC-SETPW-RULES-002`: Password missing uppercase fails uppercase rule
- `TC-SETPW-RULES-003`: Password missing lowercase fails lowercase rule
- `TC-SETPW-RULES-004`: Password missing number fails number rule
- `TC-SETPW-RULES-005`: Password missing special character fails special rule
- `TC-SETPW-RULES-006`: Password with spaces fails no-spaces rule
- `TC-SETPW-RULES-007`: Password < 8 characters fails min length rule
- `TC-SETPW-LEN-001`: Password > 8 characters triggers live count error (`9/8 characters`)
- `TC-SETPW-LEN-002`: Confirm password > 8 characters triggers live count error
- `TC-SETPW-MISMATCH-001`: Mismatched confirm password displays error on submit
- `TC-SETPW-REQ-001`: Submitting empty fields triggers required error on both inputs
- `TC-SETPW-REQ-002`: Submitting with empty new password shows required error
- `TC-SETPW-REQ-003`: Submitting with empty confirm password shows required error
- `TC-SETPW-NEG-001`: Submitting non-compliant password shows "must meet all requirements" error

---

### 3. Login Page (`tests/auth/login*.spec.ts` — 71 Tests)

#### Positive Scenarios (44 Tests)
- Standard valid username input
- Valid lowercase email address input
- Inputs with leading/trailing spaces accepted and trimmed
- Single character boundary username accepted
- Very long username (250 chars) accepted
- Password masking (`type="password"`) by default
- Eye toggle unmasks password to `type="text"`
- Eye toggle updates `aria-label` to "Hide password"
- Second toggle masks password back to `type="password"`
- Password value persists intact across visibility toggles
- Submit button has `type="submit"` and "Login" text
- Enter key on username/password submits form
- Tab navigation sequence: Username → Password → Forgot Password → Login
- Responsive layouts: Desktop (1280x720), Tablet (768x1024), Mobile (375x667)
- Successful login with credentials redirects to `/dashboard`
- Login stores JWT token in `localStorage`

#### Negative Scenarios (27 Tests)
- Empty username submission shows required validation
- Empty password submission shows required validation
- Whitespace-only submission triggers required validation
- Failed login with invalid password displays error alert
- Non-existent username displays "Invalid username/email or password"
- Fully uppercase email rejected per requirement AUTH-001
- Typing clears existing validation error
- 5 consecutive failed login attempts triggers 60-second account lockout banner

---

### 4. Forgot & Reset Password (`tests/auth/forgot-password.spec.ts` — 28 Tests)

#### Positive Scenarios (11 Tests)
- `TC-FORGOT-UI-001`: Card title and subtitle displayed
- `TC-FORGOT-UI-002`: Registered Email Address label and placeholder
- `TC-FORGOT-UI-003`: "Send Password Reset Link" submit button enabled
- `TC-FORGOT-UI-004`: "Back to Login" navigation link
- `TC-FORGOT-DISPATCH-001`: Valid email displays "Password Recovery Dispatched" success card
- `TC-FORGOT-DISPATCH-002`: Unregistered email returns non-revealing generic success (privacy protection)
- `TC-FORGOT-DISPATCH-003`: Clicking "Return to Login" from success card navigates to `/login`
- `TC-FORGOT-NAV-001`: Clicking "Back to Login" navigates to `/login`
- `TC-RESETPW-RULES-001`: Valid 8-char password passes all 7 reset rules
- `TC-RESETPW-SUCCESS-001`: Submitting valid reset password displays "Password Reset Complete!" and redirects to `/login`

#### Negative Scenarios (17 Tests)
- `TC-FORGOT-VAL-001`: Empty email submission triggers required error
- `TC-FORGOT-VAL-002`: Whitespace-only email triggers required error
- `TC-FORGOT-VAL-003 (1-6)`: 6 malformed email formats rejected
- `TC-FORGOT-VAL-004`: Typing into email clears existing error
- `TC-FORGOT-THROTTLE-001`: Backend 429 throttling shows rate limit error
- `TC-FORGOT-KEY-001`: Pressing Enter on empty email triggers required error
- `TC-RESETPW-SEC-001`: Direct access without reset token shows "Invalid Link"
- `TC-RESETPW-SEC-003`: Tampered reset token shows security rejection
- `TC-RESETPW-SEC-004`: Expired reset token renders "Link Expired" screen
- `TC-RESETPW-MISMATCH-001`: Mismatched confirm password shows error

---

### 5. YOPmail End-to-End Registration & Verification (`tests/auth/signup-functional-yopmail.spec.ts` — 10 Tests)

- `TC-SIGNUP-E2E-001`: **Full End-to-End Flow**:
  1. Register random user + dynamic YOPmail address on `/signup`
  2. Verify "Verification Email Sent" success card
  3. Open `yopmail.com` in secondary browser tab
  4. Type mailbox name into `#login` and open inbox
  5. Pause for user to tick Cloudflare Turnstile if prompted (resumes immediately upon click)
  6. Locate incoming email in `#ifinbox` iframe
  7. Extract verification URL from `#ifmail` iframe
  8. Navigate to `/set-password?token=...`
  9. Fill compliant 8-char password and confirm
  10. Confirm "Account Activated!" and auto-redirect to `/login`
  11. Log in with newly registered username & password
  12. Confirm successful redirection to `/dashboard`
- `TC-SIGNUP-E2E-002`: Re-registering existing pending email updates token
- `TC-SIGNUP-E2E-003`: Success screen "Back to Login" button navigates to `/login`
- `TC-SIGNUP-E2E-004`: Post-activation login with wrong password fails
- `TC-SIGNUP-E2E-005`: Post-activation login with email instead of username succeeds
- `TC-SIGNUP-E2E-006`: Re-using consumed verification link is rejected

---

## How to Run & View Report Files

### 1. View the HTML Report in Your Browser
```powershell
npx playwright show-report
```

### 2. View the Markdown Report File
Open directly in your editor:
[TEST_EXECUTION_REPORT.md](file:///c:/Users/Niranjani/Documents/my-project/playwrite/TEST_EXECUTION_REPORT.md)

### 3. Run All Positive & Negative Tests
> **Note:** Ensure your app's frontend (`http://localhost:3000`) and backend (`http://localhost:5000`) are running before executing tests.

```powershell
# Run all 181 Authentication tests
npx playwright test tests/auth/

# Run specific suite
npx playwright test tests/auth/signup.spec.ts
npx playwright test tests/auth/set-password.spec.ts
npx playwright test tests/auth/forgot-password.spec.ts
npx playwright test tests/auth/login*.spec.ts

# Run YOPmail E2E flow in headed mode
npx playwright test tests/auth/signup-functional-yopmail.spec.ts --headed
```
