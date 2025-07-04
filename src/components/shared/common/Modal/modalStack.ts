/**
 * @file modalStack.ts
 * @description Manages a global, reactive stack of open modals to handle nested modal interactions correctly.
 * This store uses a simple publish-subscribe pattern, making it compatible with React's `useSyncExternalStore` hook.
 * This allows multiple, separate Modal components to share and react to a single source of truth about which modals are open
 * and which one is currently on top, solving complex event propagation issues in nested scenarios.
 * @author fmw666@github
 */

type Listener = () => void;
const listeners: Set<Listener> = new Set();

let modalStack: readonly number[] = [];

/**
 * Notifies all subscribed listeners that the modal stack has changed.
 * This function is called whenever a modal is pushed or popped.
 */
function emitChange() {
  // Using a for...of loop for Set iteration is safe and efficient.
  for (const listener of listeners) {
    listener();
  }
}

export const modalStackStore = {
  /**
   * Adds a modal's unique ID to the top of the stack.
   * This is called when a modal becomes open. It creates a new array to ensure immutability.
   * @param id The unique ID of the modal to push onto the stack.
   */
  push(id: number) {
    // Defensive check to prevent duplicate IDs in the stack.
    if (modalStack.includes(id)) return;
    modalStack = [...modalStack, id];
    emitChange();
  },

  /**
   * Removes a modal's unique ID from the stack.
   * This is called when a modal closes or unmounts. It creates a new array.
   * @param id The unique ID of the modal to remove from the stack.
   */
  pop(id: number) {
    const newStack = modalStack.filter(i => i !== id);
    // Only emit a change if a modal was actually removed to avoid unnecessary re-renders.
    if (newStack.length < modalStack.length) {
      modalStack = newStack;
      emitChange();
    }
  },

  /**
   * Subscribes a listener function to be called on any stack changes.
   * This is the core of the pub-sub mechanism for `useSyncExternalStore`.
   * @param listener The callback function to subscribe.
   * @returns A function to unsubscribe the listener, preventing memory leaks.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Returns a snapshot of the current modal stack.
   * `useSyncExternalStore` uses this to detect if a change has occurred.
   * The returned value is stable unless the stack has actually changed.
   * @returns The current modal stack array.
   */
  getSnapshot(): readonly number[] {
    return modalStack;
  },
};
