import { randomBytes } from 'node:crypto';

/**
 * Options for generating randomized test users
 */
export interface RandomUserOptions {
  usernamePrefix?: string;
  yopmailPrefix?: string;
  domain?: string;
}

/**
 * Generated random user object containing all credentials and mailbox info
 */
export interface RandomUserData {
  username: string;
  email: string;
  yopmailInbox: string;
  password: string;
  confirmPassword: string;
}

/**
 * Generates a random alphanumeric username within valid boundaries (2 to 50 characters)
 * Example output: "user_a9f4c1"
 */
export function generateRandomUsername(prefix = 'user', maxLen = 16): string {
  const timestamp = Date.now().toString().slice(-4);
  const randomHex = randomBytes(2).toString('hex');
  const generated = `${prefix}_${timestamp}${randomHex}`;
  return generated.slice(0, Math.min(maxLen, 50));
}

/**
 * Generates a valid 8-character password strictly satisfying all 7 application rules:
 * 1. Exactly 8 characters long (min 8, max 8)
 * 2. At least 1 uppercase letter (A-Z)
 * 3. At least 1 lowercase letter (a-z)
 * 4. At least 1 number (0-9)
 * 5. At least 1 special character (!@#$%^&*...)
 * 6. No spaces
 *
 * Example output: "K9$mB2!q", "X7#pQ1@z"
 */
export function generateValidPassword(): string {
  const upperLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerLetters = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specialChars = '!@#$%&*';

  // Ensure 1 of each required character category
  const u = upperLetters[Math.floor(Math.random() * upperLetters.length)];
  const l = lowerLetters[Math.floor(Math.random() * lowerLetters.length)];
  const d = digits[Math.floor(Math.random() * digits.length)];
  const s = specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill remaining 4 characters from all sets combined
  const allChars = upperLetters + lowerLetters + digits + specialChars;
  let remaining = '';
  for (let i = 0; i < 4; i++) {
    remaining += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the 8 characters randomly
  const passwordArray = (u + l + d + s + remaining).split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

/**
 * Generates targeted invalid passwords for negative and boundary testing
 */
export function generateInvalidPassword(
  type:
    | 'too_short'
    | 'too_long'
    | 'no_uppercase'
    | 'no_lowercase'
    | 'no_number'
    | 'no_special'
    | 'has_spaces',
): string {
  switch (type) {
    case 'too_short':
      return 'Sec1!'; // 5 chars (< 8)
    case 'too_long':
      return 'Secure1!9'; // 9 chars (> 8)
    case 'no_uppercase':
      return 'secure1!'; // Missing uppercase
    case 'no_lowercase':
      return 'SECURE1!'; // Missing lowercase
    case 'no_number':
      return 'Secure!!'; // Missing digit
    case 'no_special':
      return 'Secure12'; // Missing special char
    case 'has_spaces':
      return 'Sec 1!a'; // Contains space
    default:
      return 'invalid';
  }
}

/**
 * Generates a unique Yopmail email address and its corresponding inbox username.
 * Reads the base prefix from process.env.YOPMAIL_USER (default: 'niranjani_test').
 *
 * Example output:
 * {
 *   email: "niranjani_test_9281a4@yopmail.com",
 *   inbox: "niranjani_test_9281a4"
 * }
 */
export function generateYopmailAccount(customPrefix?: string): {
  email: string;
  inbox: string;
} {
  const basePrefix =
    customPrefix ||
    process.env.YOPMAIL_USER ||
    (process.env.YOPMAIL_EMAIL ? process.env.YOPMAIL_EMAIL.split('@')[0] : 'niranjani_test');

  const timestamp = Date.now().toString().slice(-4);
  const randomHex = randomBytes(2).toString('hex');
  const inbox = `${basePrefix}_${timestamp}${randomHex}`;
  const domain = 'yopmail.com';

  return {
    email: `${inbox}@${domain}`,
    inbox,
  };
}

/**
 * Generates a complete random user credential bundle for end-to-end testing
 */
export function generateRandomUser(options?: RandomUserOptions): RandomUserData {
  const username = generateRandomUsername(options?.usernamePrefix);
  const { email, inbox } = generateYopmailAccount(options?.yopmailPrefix);
  const password = generateValidPassword();

  return {
    username,
    email,
    yopmailInbox: inbox,
    password,
    confirmPassword: password,
  };
}
