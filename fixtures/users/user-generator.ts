/**
 * Dynamic User Generator for LifeTrack AI Automation Fixtures
 * Adheres strictly to LifeTrack AI validation rules:
 * 1. Exactly 8 characters password length
 * 2. At least 1 uppercase letter (A-Z)
 * 3. At least 1 lowercase letter (a-z)
 * 4. At least 1 digit (0-9)
 * 5. At least 1 special character (!@#$%&*...)
 * 6. No whitespace characters
 * 7. Username between 2 and 50 characters, letters/numbers/underscores
 */

export interface GeneratedUser {
  username: string;
  email: string;
  yopmailInbox: string;
  password: string;
  confirmPassword: string;
  createdAt: string;
}

export class UserGenerator {
  private static readonly UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
  private static readonly DIGITS = '23456789';
  private static readonly SPECIAL = '!@#$%&*';

  /**
   * Generates a unique, valid username between 6 and 20 characters
   */
  public static generateRandomUsername(prefix = 'user'): string {
    const timestamp = Date.now().toString(36);
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16);
    return `${prefix}_${timestamp}${randomHex}`.slice(0, 20);
  }

  /**
   * Generates a compliant 8-character password meeting all 7 application rules
   */
  public static generateValidPassword(): string {
    // Pick 1 of each required character category
    const upper = this.UPPERCASE[Math.floor(Math.random() * this.UPPERCASE.length)];
    const lower = this.LOWERCASE[Math.floor(Math.random() * this.LOWERCASE.length)];
    const digit = this.DIGITS[Math.floor(Math.random() * this.DIGITS.length)];
    const special = this.SPECIAL[Math.floor(Math.random() * this.SPECIAL.length)];

    // Fill remaining 4 chars to make exactly 8 characters total
    const pool = this.UPPERCASE + this.LOWERCASE + this.DIGITS + this.SPECIAL;
    let remaining = '';
    for (let i = 0; i < 4; i++) {
      remaining += pool[Math.floor(Math.random() * pool.length)];
    }

    // Shuffle characters
    const allChars = [upper, lower, digit, special, ...remaining.split('')];
    for (let i = allChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }

    return allChars.join('');
  }

  /**
   * Generates a Yopmail email address for testing
   */
  public static generateYopmailEmail(username?: string): string {
    const user = username || this.generateRandomUsername('test');
    return `${user}@yopmail.com`.toLowerCase();
  }

  /**
   * Generates an intentionally invalid password for negative testing
   */
  public static generateInvalidPassword(
    type: 'too_short' | 'too_long' | 'no_upper' | 'no_lower' | 'no_digit' | 'no_special' | 'has_space'
  ): string {
    switch (type) {
      case 'too_short':
        return 'Aa1!'; // 4 chars
      case 'too_long':
        return 'Aa1!bcdefghij'; // >8 chars
      case 'no_upper':
        return 'abc1!def'; // no uppercase
      case 'no_lower':
        return 'ABC1!DEF'; // no lowercase
      case 'no_digit':
        return 'Abc!defg'; // no digit
      case 'no_special':
        return 'Abc1def2'; // no special
      case 'has_space':
        return 'Ab 1!def'; // contains space
      default:
        return 'invalid';
    }
  }

  /**
   * Generates a full random user object dynamically
   */
  public static generateRandomUser(prefix = 'dyn_user'): GeneratedUser {
    const username = this.generateRandomUsername(prefix);
    const email = this.generateYopmailEmail(username);
    const password = this.generateValidPassword();

    return {
      username,
      email,
      yopmailInbox: username.toLowerCase(),
      password,
      confirmPassword: password,
      createdAt: new Date().toISOString(),
    };
  }
}
