import { randomUUID } from 'node:crypto';

export function uniqueValue(prefix = 'test'): string {
  return `${prefix}-${randomUUID()}`;
}

export function uniqueEmail(domain = 'example.test'): string {
  return `${uniqueValue('user')}@${domain}`;
}
