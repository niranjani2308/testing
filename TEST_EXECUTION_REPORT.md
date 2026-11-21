# Comprehensive Authentication Module Test Execution & Coverage Report

**Generated on:** 2026-11-21  
**Project:** LifeTrack AI / Auth Application  
**Framework:** Playwright (TypeScript)  
**Total Tests:** **198 Automated Test Cases** across **9 Focused Test Files**  
**Report Location:**
- **Interactive HTML Report:** [playwright-report/index.html](file:///c:/Users/Niranjani/Documents/my-project/playwrite/playwright-report/index.html)
- **Execution Summary:** [TEST_EXECUTION_REPORT.md](file:///c:/Users/Niranjani/Documents/my-project/playwrite/TEST_EXECUTION_REPORT.md)

---

## Executive Summary (Sequential Execution Order)

| Execution Order | Spec File | Tests | Focus Areas |
| :--- | :--- | :---: | :--- |
| **1. Create Account (Signup)** | `01-signup.spec.ts` | **46** | UI, boundaries, required fields, invalid email formats, duplicate email/username (409), 429 throttling, keyboard submit, padding/margin box model, responsive viewports, content hygiene & unwanted words |
| **2. Set Password** | `02-set-password.spec.ts` | **36** | Direct access security, 7-rule live checklist, password length limit counter, mismatch, expired/used token states, styling/padding, responsive metrics, unwanted words |
| **3. Login (Fields & Buttons)** | `03-login-fields-buttons.spec.ts` | **22** | Autofocus, valid/invalid credentials, password masking/unmasking toggles, submit button, Enter key |
| **4. Login (Validation & Links)** | `04-login-validation-links.spec.ts` | **16** | Required field errors, uppercase email rejection (AUTH-001), 5 failed attempts lockout banner, navigation links |
| **5. Login (Keyboard & A11y)** | `05-login-keyboard-a11y-responsive.spec.ts` | **15** | Tab navigation sequence, aria attributes, responsive layouts (Mobile/Tablet/Desktop) |
| **6. Login (UI & Layout)** | `06-login-ui-layout.spec.ts` | **19** | Card title, subtitle, labels, placeholders, branding elements, computed padding/margin box model, submit button styles, content hygiene & unwanted words |
| **7. Login (E2E Authentication)** | `07-login.spec.ts` | **2** | Valid credentials redirect to Dashboard; invalid credentials display error alert |
| **8. Forgot & Reset Password** | `08-forgot-password.spec.ts` | **32** | Email format validations, 60s cooldown timer, generic success for privacy, reset token security, 7 rules, mismatch, UI padding/margin, responsive viewports, unwanted words |
| **9. Full Auth Lifecycle (YOPmail)** | `09-signup-functional-yopmail.spec.ts` | **10** | Complete 7-step lifecycle: Signup $\rightarrow$ Set Password $\rightarrow$ Login $\rightarrow$ Forgot Password $\rightarrow$ Reset Password $\rightarrow$ Old password rejection $\rightarrow$ Login with new reset password |
| **TOTAL** | **9 Sequenced Files** | **198** | **Full Positive, Negative & Complete Lifecycle Coverage** |

---

## Detailed Test Scenarios by Area & Capability

### 1. Create an Account (`tests/auth/signup.spec.ts` — 46 Tests)

- **UI & Visual Layout**:
  - `TC-SIGNUP-UI-001`: Auth card and brand icon are displayed correctly
  - `TC-SIGNUP-UI-002`: Exact page title and descriptive subtitle are visible
  - `TC-SIGNUP-UI-003`: Username label and placeholder are visible
  - `TC-SIGNUP-UI-004`: Email address label and placeholder are visible
  - `TC-SIGNUP-UI-005`: "Verify / Create Account" submit button is enabled on load
  - `TC-SIGNUP-UI-006`: Footer prompt and "Sign In" link pointing to `/login`
- **Accessibility & Attributes**:
  - `TC-SIGNUP-A11Y-001`: Username field has autofocus on initial page mount
  - `TC-SIGNUP-A11Y-002`: Username input has `autocomplete="username"` and `type="text"`
  - `TC-SIGNUP-A11Y-003`: Email input has `type="email"` and valid placeholder
- **Field Validations (Positive & Negative)**:
  - `TC-SIGNUP-VAL-001`: Submitting empty form triggers validation on both fields
  - `TC-SIGNUP-VAL-002`: Submitting with only username triggers email required error
  - `TC-SIGNUP-VAL-003`: Submitting with only email triggers username required error
  - `TC-SIGNUP-VAL-004`: Submitting whitespace-only inputs triggers required errors
  - `TC-SIGNUP-BOUND-001`: (Negative) Username with 1 character (< 2) triggers min length error
  - `TC-SIGNUP-BOUND-002`: (Positive) Username with exactly 2 characters (boundary min) passes validation
  - `TC-SIGNUP-BOUND-003`: (Positive) Username with exactly 50 characters (boundary max) passes validation
  - `TC-SIGNUP-BOUND-004`: (Negative) Username with 51 characters (> 50) triggers max length error
  - `TC-SIGNUP-BOUND-005`: (Positive) Typing into username clears existing error
- **Email Format Validations (Negative & Positive)**:
  - `TC-SIGNUP-EMAIL-VAL (1)`: Rejects "plainaddress"
  - `TC-SIGNUP-EMAIL-VAL (2)`: Rejects "@missingusername.com"
  - `TC-SIGNUP-EMAIL-VAL (3)`: Rejects "username@.com"
  - `TC-SIGNUP-EMAIL-VAL (4)`: Rejects "username@com"
  - `TC-SIGNUP-EMAIL-VAL (5)`: Rejects "user with space@domain.com"
  - `TC-SIGNUP-EMAIL-VAL (6)`: Rejects "user@domain,com"
  - `TC-SIGNUP-EMAIL-002`: (Positive) Typing into email clears existing error
- **Navigation & Links**:
  - `TC-SIGNUP-NAV-001`: Clicking "Sign In" footer link navigates to `/login`
- **Responsive Viewport Testing**:
  - `TC-SIGNUP-RESP-001`: Responsive layout on Desktop (1280x720)
  - `TC-SIGNUP-RESP-002`: Responsive layout on Tablet (768x1024)
  - `TC-SIGNUP-RESP-003`: Responsive layout on Mobile (375x667)
- **Keyboard Submission**:
  - `TC-SIGNUP-VAL-005`: Pressing Enter on username field triggers form validation
  - `TC-SIGNUP-VAL-006`: Pressing Enter on email field triggers form validation
- **Backend Response Handling**:
  - `TC-SIGNUP-UI-007`: (Positive) Submit button shows loading/disabled state during submission
  - `TC-SIGNUP-UI-008`: (Negative) Re-registering already-verified email displays 409 Conflict error
  - `TC-SIGNUP-UI-009`: (Negative) Registering already-taken username displays 409 Conflict error
  - `TC-SIGNUP-UI-010`: (Positive) Success card displays submitted email and 2-minute validity note
  - `TC-SIGNUP-UI-011`: (Negative) Submitting during active 60s cooldown displays 429 Throttling error
- **Error Clearing & Interactions**:
  - `TC-SIGNUP-NEG-001`: Clearing username after valid input triggers required error
  - `TC-SIGNUP-NEG-002`: Clearing email after valid input triggers required error
  - `TC-SIGNUP-NEG-003`: Valid username with invalid email only displays email error
- **UI Box Model, Padding, Margin & Styling Verification**:
  - `TC-SIGNUP-STYLE-001`: Auth card has correct padding (>= 16px), background color (`rgb(255, 255, 255)`), and max-width (`448px`)
  - `TC-SIGNUP-STYLE-002`: Submit button has full width, visible padding, and rounded corners
  - `TC-SIGNUP-STYLE-003`: Form inputs have consistent padding and vertical margins
- **Content Hygiene & Unwanted Words Verification**:
  - `TC-SIGNUP-WORDS-001`: Page text must not contain debug, placeholder, or unwanted strings (`undefined`, `null`, `NaN`, `[object Object]`, `TODO`, `FIXME`, `Lorem ipsum`, `dummy`, `sample text`, `test test`)
  - `TC-SIGNUP-WORDS-002`: Labels and placeholders must not contain `"undefined"` or `"null"`

---

### 2. Set Password (`tests/auth/set-password.spec.ts` — 36 Tests)

- **Direct Access & Token Security**:
  - `TC-SETPW-SEC-001`: (Negative) Direct navigation without token blocks access and hides inputs
  - `TC-SETPW-SEC-002`: (Positive) Blocked screen "Request New Verification Link" navigates to `/signup`
  - `TC-SETPW-SEC-002B`: (Positive) Blocked screen "Back to Login" navigates to `/login`
  - `TC-SETPW-SEC-003`: (Negative) Navigation with invalid/tampered token shows security rejection
  - `TC-SETPW-SEC-004`: (Negative) Expired token shows "Link Expired" screen and hides password form
- **Form UI & Layout**:
  - `TC-SETPW-UI-001`: Set Your Password title, subtitle, labels, and submit button
  - `TC-SETPW-UI-002`: Complete 7-rule Password Requirements box is visible
  - `TC-SETPW-UI-003`: Password visibility toggles switch input types between `password` and `text`
  - `TC-SETPW-UI-004`: Submit button text is "Activate Account & Set Password"
  - `TC-SETPW-UI-005`: Footer displays "Already verified?" with link to `/login`
- **Accessibility & Focus**:
  - `TC-SETPW-A11Y-001`: Create Password input has autofocus on page load
  - `TC-SETPW-A11Y-002`: Tab navigation navigates from Create Password to Confirm Password
- **7 Live Password Checklist Rules (Positive & Negative)**:
  - `TC-SETPW-RULES-001`: (Positive) Compliant 8-character password satisfies all 7 checklist rules
  - `TC-SETPW-RULES-002`: (Negative) Password missing uppercase fails uppercase rule
  - `TC-SETPW-RULES-003`: (Negative) Password missing lowercase fails lowercase rule
  - `TC-SETPW-RULES-004`: (Negative) Password missing number fails number rule
  - `TC-SETPW-RULES-005`: (Negative) Password missing special character fails special rule
  - `TC-SETPW-RULES-006`: (Negative) Password with spaces fails no-spaces rule
  - `TC-SETPW-RULES-007`: (Negative) Password < 8 characters fails min length rule
- **Password Length Boundary Rules**:
  - `TC-SETPW-LEN-001`: (Negative) Password > 8 characters triggers live count error (`9/8 characters`)
  - `TC-SETPW-LEN-002`: (Negative) Confirm password > 8 characters triggers live count error
  - `TC-SETPW-LEN-003`: (Positive) Typing valid 8-char password clears exceeds-limit error
  - `TC-SETPW-LEN-004`: (Positive) Typing valid confirm password clears confirm exceeds-limit error
- **Password Mismatch & Required Fields**:
  - `TC-SETPW-MISMATCH-001`: (Negative) Mismatched confirm password displays error on submit
  - `TC-SETPW-MISMATCH-002`: (Positive) Matching valid passwords do not trigger mismatch error
  - `TC-SETPW-REQ-001`: (Negative) Submitting empty fields triggers required error on both inputs
  - `TC-SETPW-REQ-002`: (Negative) Submitting with empty new password shows required error
  - `TC-SETPW-REQ-003`: (Negative) Submitting with empty confirm password shows required error
  - `TC-SETPW-NEG-001`: (Negative) Submitting non-compliant password shows "must meet all requirements" error
  - `TC-SETPW-POS-001`: (Positive) Valid password submission displays "Account Activated!" success card
- **UI Styling, Padding, Margin & Responsive Metrics**:
  - `TC-SETPW-STYLE-001`: Auth card computed padding, border-radius, and background color
  - `TC-SETPW-STYLE-002`: Submit button dimensions, padding, cursor, and rounded corners
  - `TC-SETPW-RESP-001`: Responsive layouts across Desktop, Tablet, and Mobile
- **Content Hygiene & Unwanted Words**:
  - `TC-SETPW-WORDS-001`: Blocked/unauthorized screen contains no unwanted or placeholder words
  - `TC-SETPW-WORDS-002`: Set password form screen contains no unwanted or placeholder words

---

### 3. Forgot & Reset Password (`tests/auth/forgot-password.spec.ts` — 32 Tests)

- **UI & Visual Layout**:
  - `TC-FORGOT-UI-001`: Card title and subtitle displayed
  - `TC-FORGOT-UI-002`: Registered Email Address label and placeholder
  - `TC-FORGOT-UI-003`: "Send Password Reset Link" submit button enabled
  - `TC-FORGOT-UI-004`: "Back to Login" navigation link
- **Field Validations (Positive & Negative)**:
  - `TC-FORGOT-VAL-001`: (Negative) Empty email submission triggers required error
  - `TC-FORGOT-VAL-002`: (Negative) Whitespace-only email triggers required error
  - `TC-FORGOT-VAL-003 (1-6)`: (Negative) 6 malformed email formats rejected
  - `TC-FORGOT-VAL-004`: (Positive) Typing into email clears existing error
- **Password Recovery Dispatch (Positive & Security)**:
  - `TC-FORGOT-DISPATCH-001`: (Positive) Valid email displays "Password Recovery Dispatched" success card
  - `TC-FORGOT-DISPATCH-002`: (Security) Unregistered email returns non-revealing generic success (privacy protection)
  - `TC-FORGOT-DISPATCH-003`: (Positive) Clicking "Return to Login" from success card navigates to `/login`
- **Cooldown & Throttling Feedback**:
  - `TC-FORGOT-THROTTLE-001`: (Negative) Backend 429 throttling shows rate limit error
  - `TC-FORGOT-THROTTLE-002`: (Positive) Submit button shows loading spinner during submission
- **Keyboard & Navigation**:
  - `TC-FORGOT-NAV-001`: Clicking "Back to Login" navigates to `/login`
  - `TC-FORGOT-KEY-001`: Pressing Enter on empty email triggers required error
- **Reset Password Token Security**:
  - `TC-RESETPW-SEC-001`: (Negative) Direct access without reset token shows "Invalid Link"
  - `TC-RESETPW-SEC-003`: (Negative) Tampered reset token shows security rejection
  - `TC-RESETPW-SEC-004`: (Negative) Expired reset token renders "Link Expired" screen
- **Reset Password Rules, Mismatch & Success**:
  - `TC-RESETPW-RULES-001`: (Positive) Valid 8-char password passes all 7 reset rules
  - `TC-RESETPW-MISMATCH-001`: (Negative) Mismatched confirm password shows error
  - `TC-RESETPW-SUCCESS-001`: (Positive) Submitting valid reset password displays "Password Reset Complete!" and redirects to `/login`
- **UI Styling, Padding, Margin & Responsive Metrics**:
  - `TC-FORGOT-STYLE-001`: Forgot Password auth card computed padding, background, max-width
  - `TC-FORGOT-RESP-001`: Forgot Password responsive layout (Desktop, Tablet, Mobile)
- **Content Hygiene & Unwanted Words**:
  - `TC-FORGOT-WORDS-001`: Forgot Password page contains no placeholder/debug strings
  - `TC-RESETPW-WORDS-001`: Reset Password page contains no placeholder/debug strings

---

### 4. Login Page (`tests/auth/login*.spec.ts` — 74 Tests across 5 files)

- **Fields & Buttons (`login-fields-buttons.spec.ts` — 22 Tests)**:
  - Username field autofocus, valid inputs, whitespace trimming, boundary limits (1 and 250 characters)
  - Password masking (`type="password"`) by default
  - Eye icon toggling: unmask to `type="text"`, update `aria-label`, re-mask back to `type="password"`
  - Password value persistence intact across visibility toggles
  - Submit button visibility, enabled state, `type="submit"`, Enter key submission
- **UI & Layout (`login-ui-layout.spec.ts` — 19 Tests)**:
  - Card title, subtitle, labels, placeholders, branding elements
  - Computed styles: card padding (>= 16px), background color (`rgb(255, 255, 255)`), max-width (`448px`), button padding and cursor
  - Content hygiene & unwanted words: verifies page text and placeholders contain no debug/dummy strings (`undefined`, `null`, `NaN`, `[object Object]`, `TODO`, `FIXME`, `Lorem ipsum`, `dummy`, `sample text`, `test test`)
- **Validation & Links (`login-validation-links.spec.ts` — 16 Tests)**:
  - Required username and password validation
  - Whitespace-only submission handling
  - Uppercase email rejection (AUTH-001)
  - Navigation links to `/forgot-password` and `/signup`
  - 5 consecutive failed login attempts account lockout banner
- **Keyboard, Accessibility & Responsive (`login-keyboard-a11y-responsive.spec.ts` — 15 Tests)**:
  - Tab navigation sequence: Username → Password → Forgot Password → Login
  - Form input ARIA attributes and focus indicators
  - Responsive layouts: Desktop (1280x720), Tablet (768x1024), Mobile (375x667)
- **E2E Authentication (`login.spec.ts` — 2 Tests)**:
  - Successful login with credentials redirects to `/dashboard`
  - Failed login with invalid password displays error alert

---

### 5. YOPmail End-to-End Registration & Verification (`tests/auth/signup-functional-yopmail.spec.ts` — 10 Tests)

- `TC-SIGNUP-E2E-001`: **Master End-to-End Continuous Journey Flow**:
  1. **Stage 1 (Create an Account)**:
     - Verify page title, subtitle, labels, and placeholders
     - Verify content hygiene: scan page text for unwanted words (`undefined`, `null`, `NaN`, `TODO`, `dummy`, etc.)
     - Verify UI styling: card padding $\ge 16$px, white background, button pointer cursor
     - **Button enforcement & validation checks**:
       - Empty submit $\rightarrow$ verifies username & email required errors, form submission blocked
       - Username filled, email empty $\rightarrow$ verifies email required error
       - Email filled, username empty $\rightarrow$ verifies username required error
       - Boundary username (1 char) $\rightarrow$ verifies min length error
       - Invalid email format (`notanemail`) $\rightarrow$ verifies email format error
       - Typing into field clears error
     - Fill valid dynamic random username and YOPmail address
     - Click "Verify / Create Account" submit button
     - Verify success card appears with "Verification Email Sent", displays submitted email, and 2-minute validity note
  2. **Stage 2 (YOPmail Link Retrieval)**:
     - Open YOPmail inbox in secondary browser tab
     - Handle Cloudflare Turnstile human verification modal safely if displayed (pauses and waits for user click, auto-resumes once closed)
     - Locate incoming email in `#ifinbox` iframe
     - Extract verification URL from `#ifmail` iframe (`/set-password?token=...`)
     - Validate token parameter presence and close secondary mail tab
  3. **Stage 3 (Set Password Page)**:
     - Navigate to extracted verification URL
     - Verify Set Your Password card, title, 7-rule requirements checklist box
     - Verify content hygiene: no unwanted words
     - **Set Password functional & live rule validations**:
       - Empty submit $\rightarrow$ verifies required errors, submission blocked
       - Checklist test: enter `abc` (lowercase only) $\rightarrow$ verifies uppercase, number, and special character rules fail
       - Boundary counter test: enter 9 characters (`LongPass1!`) $\rightarrow$ verifies `exceeds 8-character limit` error
       - Mismatch test: enter valid password in new and different password in confirm $\rightarrow$ verifies mismatch error
       - Visibility toggles: eye button toggles input types between `password` and `text`
     - Enter compliant 8-character password (`Valid123!`) in both fields
     - Click "Activate Account & Set Password"
     - Verify "Account Activated!" success state and redirection to `/login`
  4. **Stage 4 (Login Page & Dashboard)**:
     - Verify arrival on `/login` page
     - Verify UI elements and content hygiene
     - **Login validations**:
       - Empty submit $\rightarrow$ verifies username & password required errors
       - Password visibility toggle test
       - Negative login: attempt login with wrong password $\rightarrow$ verifies error alert, no redirection
     - Positive login: enter newly registered username and newly activated password
     - Click "Login" button
     - Verify successful authentication and redirection to `/dashboard`
     - Verify dashboard components loaded and visible
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
# Run all 198 Authentication tests
npx playwright test tests/auth/

# Run specific suite
npx playwright test tests/auth/signup.spec.ts
npx playwright test tests/auth/set-password.spec.ts
npx playwright test tests/auth/forgot-password.spec.ts
npx playwright test tests/auth/login*.spec.ts

# Run YOPmail E2E flow in headed mode
npx playwright test tests/auth/signup-functional-yopmail.spec.ts --headed
```
