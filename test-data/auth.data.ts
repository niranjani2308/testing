export const authTestData = {
  // Expected UI Copy & Text Content
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

  // Actual Validation Messages from application code
  validationMessages: {
    usernameRequired: 'Username or Email is required',
    passwordRequired: 'Password is required',
    uppercaseEmail: 'Uppercase email is not allowed for login. Please enter your email in lowercase.',
  },

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

  // Link URLs
  links: {
    forgotPasswordPath: '/forgot-password',
    signupPath: '/signup',
  },
} as const;
