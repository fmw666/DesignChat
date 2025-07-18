/**
 * @file modelUtils.test.ts
 * @description test modelUtils utils functions
 * @author fmw666@github
 * @date 2025-07-17
 */

import { getLatestModelsByCategory, getDefaultSelectedModels } from '../modelUtils';

const models = [
  { id: '1', category: 'A', name: 'Model1', publishDate: '2023-01-01' },
  { id: '2', category: 'A', name: 'Model2', publishDate: '2023-02-01' },
  { id: '3', category: 'B', name: 'Model3', publishDate: '2023-01-15' }
] as any;

describe('modelUtils', () => {
  it('getLatestModelsByCategory returns latest by publishDate', () => {
    const latest = getLatestModelsByCategory(models);
    expect(latest.A.name).toBe('Model2');
    expect(latest.B.name).toBe('Model3');
  });

  it('getDefaultSelectedModels returns correct structure', () => {
    const selected = getDefaultSelectedModels(models);
    expect(selected).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '2', category: 'A', name: 'Model2', count: expect.any(Number) }),
        expect.objectContaining({ id: '3', category: 'B', name: 'Model3', count: expect.any(Number) }),
      ])
    );
  });
});
