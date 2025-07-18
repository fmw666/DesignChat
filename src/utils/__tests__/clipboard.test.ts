/**
 * @file clipboard.test.ts
 * @description test clipboard utils functions
 * @author fmw666@github
 * @date 2025-07-17
 */

import { copyToClipboard } from '../clipboard';

describe('copyToClipboard', () => {
  it('returns success true when using modern clipboard API', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });

    const result = await copyToClipboard('hello');
    expect(result.success).toBe(true);
  });

  it('falls back to textarea method if clipboard API not available', async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });

    document.execCommand = jest.fn().mockReturnValue(true);

    const result = await copyToClipboard('hello');
    expect(result.success).toBe(true);
  });

  it('returns success false if both methods fail', async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });

    document.execCommand = jest.fn().mockImplementation(() => { throw new Error('fail'); });

    const result = await copyToClipboard('hello');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
