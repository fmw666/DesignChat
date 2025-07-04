/**
 * @file eventBus.ts
 * @description EventBus utility for application-wide event management and communication.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// No external imports needed

// =================================================================================================
// Type Definitions
// =================================================================================================

export type EventCallback = (...args: unknown[]) => void;

export interface EventMap {
  [key: string]: EventCallback[];
}

// =================================================================================================
// Constants
// =================================================================================================

export const EVENT_NEED_SIGN_IN = 'needSignIn';

// =================================================================================================
// EventBus Class
// =================================================================================================

/**
 * EventBus class for managing application-wide events
 * Provides pub/sub pattern for decoupled communication between components
 */
class EventBus {
  private events: EventMap = {};

  /**
   * Subscribe to an event
   * @param event - Event name to subscribe to
   * @param callback - Function to call when event is emitted
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name to unsubscribe from
   * @param callback - Function to remove from event listeners
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event with optional arguments
   * @param event - Event name to emit
   * @param args - Optional arguments to pass to event callbacks
   */
  emit(event: string, ...args: unknown[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }

  /**
   * Clear all event listeners for a specific event
   * @param event - Event name to clear
   */
  clear(event: string): void {
    delete this.events[event];
  }

  /**
   * Clear all event listeners
   */
  clearAll(): void {
    this.events = {};
  }
}

// =================================================================================================
// Export
// =================================================================================================

export const eventBus = new EventBus();
