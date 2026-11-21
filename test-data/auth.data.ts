import {
  generateRandomUsername,
  generateValidPassword,
  generateInvalidPassword,
  generateYopmailAccount,
  generateRandomUser,
} from '../utils/test-data-generator';

export const authTestData = {
  // Expected Login UI Copy & Text Content
  uiText: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account with your username and password',
    usernameLabel: 'Username or Email',
    usernamePlaceholder: 'e.g. john_doe or john@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    buttonText: 'Login',
    loadingButtonText: 'Signing in...',
    forgotPasswordText: 'Forgot Password?',
    signupPromptPrefix: "Don't have an account?",
    signupLinkText: 'Create an Account / Sign Up',
  },

  // Actual Validation Messages for Login
  validationMessages: {
    usernameRequired: 'Username or Email is required',
    passwordRequired: 'Password is required',
    uppercaseEmail: 'Uppercase email is not allowed for login. Please enter your email in lowercase.',
  },

  // Expected Signup UI Copy & Text Content
  signupUiText: {
    title: 'Create an Account',
    subtitle: 'Enter your username and email to receive a secure 2-minute verification link',
    usernameLabel: 'Username',
    usernamePlaceholder: 'e.g. john_doe',
    emailLabel: 'Email Address',
    emailPlaceholder: 'e.g. john@example.com',
    submitBtnText: 'Verify / Create Account',
    loginPromptPrefix: 'Already have an account?',
    loginLinkText: 'Sign In',
    successTitle: 'Verification Email Sent',
    linkValidityNote: 'Link valid for 2 minutes',
    backToLoginBtnText: 'Back to Login',
  },

  // Signup Validation Messages from SignupPage.tsx
  signupValidationMessages: {
    usernameRequired: 'Username is required',
    usernameMinLength: 'Username must be at least 2 characters',
    usernameMaxLength: 'Username cannot exceed 50 characters',
    emailRequired: 'Email address is required',
    emailInvalid: 'Please enter a valid email address',
    emailAlreadyRegistered: 'This email is already registered and verified. Please log in.',
    usernameAlreadyTaken: 'This username is already taken. Please choose another username.',
  },

  // Expected Set Password UI Copy & Text Content
  setPasswordUiText: {
    title: 'Set Your Password',
    subtitle: 'Create a secure password to verify your email and activate your account',
    newPasswordLabel: 'Create Password',
    newPasswordPlaceholder: 'Enter secure password (max 8 characters)',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter password',
    submitBtnText: 'Activate Account & Set Password',
    successTitle: 'Account Activated!',
    proceedToLoginBtnText: 'Proceed to Login',
    blockedTitle: 'Access Blocked',
    blockedSubtitle: 'Email verification is required',
    directAccessBlockedAlert: 'Direct Access Blocked',
    directAccessBlockedMessage: 'Email verification token is missing. You cannot access this page directly.',
    expiredTitle: 'Link Expired',
    expiredSubtitle: 'This verification link has expired',
    expiredAlertTitle: 'Verification Link Expired',
    requestNewLinkBtnText: 'Request New Verification Link',
    backToLoginBtnText: 'Back to Login',
  },

  // Set Password Validation Messages from SetPasswordPage.tsx & PasswordRules.tsx
  setPasswordValidationMessages: {
    newPasswordRequired: 'New password is required',
    confirmPasswordRequired: 'Confirm password is required',
    passwordMismatch: 'Passwords do not match',
    passwordMustMeetRequirements: 'Password must meet all requirements below (exactly 8 characters)',
    exceeds8Chars: (currentLength: number) =>
      `Password exceeds 8-character limit (${currentLength}/8 characters)`,
    confirmExceeds8Chars: (currentLength: number) =>
      `Confirm password exceeds 8-character limit (${currentLength}/8 characters)`,
  },

  // Password Rules requirement text items
  passwordRules: [
    'At least 8 characters long',
    'Maximum 8 characters allowed',
    'At least 1 uppercase letter (A-Z)',
    'At least 1 lowercase letter (a-z)',
    'At least 1 number (0-9)',
    'At least 1 special character (!@#$%^&*...)',
    'No spaces allowed',
  ],

  // Input Data Sets for Boundary, Positive & Negative Testing
  inputs: {
    validUsernames: ['john_doe', 'user_123', 'john.doe@example.com', 'test-user'],
    whitespaceOnly: '     ',
    spacesWithText: '   valid_user   ',
    specialCharacters: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
    unicodeText: 'ユーザー名123',
    veryLongUsername: 'a'.repeat(250),
    veryLongPassword: 'LongP@ssw0rd'.repeat(20),
    shortUsername: 'a',
    uppercaseEmails: ['ADMIN@EXAMPLE.COM', 'USER@TEST.ORG'],
    mixedCaseEmail: 'User@Example.com',
    invalidPassword: 'wrong-password-999',
    spaceSeparatedWords: 'john doe second',
  },

  // Signup Boundary and Edge Case Datasets
  signupInputs: {
    validUsernames: ['john_doe', 'alex99', 'user-test_01'],
    boundaryUsernames: {
      singleChar: 'a',
      minValid2Chars: 'ab',
      maxValid50Chars: 'u'.repeat(50),
      tooLong51Chars: 'u'.repeat(51),
    },
    invalidEmails: [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@com',
      'user with space@domain.com',
      'user@domain,com',
    ],
    // The application strictly requires exactly 8 characters with 1 Upper, 1 Lower, 1 Digit, 1 Special, no spaces
    valid8CharPassword: 'Secure1!',
    validAlternate8CharPassword: 'Pass9#xy',
    invalidPasswords: {
      tooShort5Chars: 'Sec1!',
      tooLong9Chars: 'Secure1!9',
      noUppercase: 'secure1!',
      noLowercase: 'SECURE1!',
      noNumber: 'Secure!!',
      noSpecial: 'Secure12',
      hasSpaces: 'Sec 1!a',
    },
  },

  // Dynamic Test Data Generators for Random Users, Passwords & Yopmail
  generators: {
    randomUsername: generateRandomUsername,
    validPassword: generateValidPassword,
    invalidPassword: generateInvalidPassword,
    yopmailAccount: generateYopmailAccount,
    randomUser: generateRandomUser,
  },

  // Link URLs
  links: {
    forgotPasswordPath: '/forgot-password',
    signupPath: '/signup',
    loginPath: '/login',
    setPasswordPath: '/set-password',
  },
} as const;
