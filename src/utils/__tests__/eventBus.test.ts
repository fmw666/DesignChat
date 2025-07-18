/**
 * @file eventBus.test.ts
 * @description test eventBus utils functions
 * @author fmw666@github
 * @date 2025-07-17
 */

import { eventBus, EVENT_NEED_SIGN_IN } from '../eventBus';

describe('eventBus', () => {
  afterEach(() => {
    eventBus.clearAll();
  });

  it('subscribes and emits events', () => {
    const cb = jest.fn();
    eventBus.on('test', cb);
    eventBus.emit('test', 1, 2);
    expect(cb).toHaveBeenCalledWith(1, 2);
  });

  it('unsubscribes from events', () => {
    const cb = jest.fn();
    eventBus.on('test', cb);
    eventBus.off('test', cb);
    eventBus.emit('test');
    expect(cb).not.toHaveBeenCalled();
  });

  it('clears specific event listeners', () => {
    const cb = jest.fn();
    eventBus.on('test', cb);
    eventBus.clear('test');
    eventBus.emit('test');
    expect(cb).not.toHaveBeenCalled();
  });

  it('clears all event listeners', () => {
    const cb = jest.fn();
    eventBus.on('test', cb);
    eventBus.clearAll();
    eventBus.emit('test');
    expect(cb).not.toHaveBeenCalled();
  });

  it('exports EVENT_NEED_SIGN_IN', () => {
    expect(EVENT_NEED_SIGN_IN).toBe('needSignIn');
  });
});
