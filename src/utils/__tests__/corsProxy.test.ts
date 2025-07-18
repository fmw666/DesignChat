/**
 * @file corsProxy.test.ts
 * @description test corsProxy utils functions
 * @author fmw666@github
 * @date 2025-07-17
 */

import { corsProxy } from '../corsProxy';

describe('corsProxy', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getProxyServices returns array', () => {
    expect(Array.isArray(corsProxy.getProxyServices())).toBe(true);
  });

  it('addProxyService and removeProxyService work', () => {
    const service = {
      name: 'test',
      url: 'https://test.com',
      transform: (url: string) => url,
    };
    corsProxy.addProxyService(service);
    expect(corsProxy.getProxyServices().some(s => s.name === 'test')).toBe(true);
    corsProxy.removeProxyService('test');
    expect(corsProxy.getProxyServices().some(s => s.name === 'test')).toBe(false);
  });

  it('fetchImage returns success false if all fail', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValue({ ok: false });
    const result = await corsProxy.fetchImage('https://fail.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/所有访问方法都失败/);
  });
});
