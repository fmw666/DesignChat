/**
 * @file avatar.test.ts
 * @description test avatar utils functions
 * @author fmw666@github
 * @date 2025-07-17
 */

import { getAvatarText, getAvatarClasses, getAvatarSizeClasses } from '../avatar';

describe('avatar utils', () => {
  it('returns fallback text when user is null', () => {
    expect(getAvatarText(null)).toBe('?');
  });

  it('returns first letter of display_name if present', () => {
    const user = { user_metadata: { display_name: 'Alice' }, email: 'alice@example.com' };
    expect(getAvatarText(user as any)).toBe('A');
  });

  it('returns first letter of email username if no display_name', () => {
    const user = { user_metadata: {}, email: 'bob@example.com' };
    expect(getAvatarText(user as any)).toBe('B');
  });

  it('returns correct base classes', () => {
    expect(getAvatarClasses()).toMatch(/rounded-full/);
  });

  it('returns correct size classes', () => {
    expect(getAvatarSizeClasses('sm')).toContain('w-8');
    expect(getAvatarSizeClasses('md')).toContain('w-10');
    expect(getAvatarSizeClasses('lg')).toContain('w-24');
  });
});
