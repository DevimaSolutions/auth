import type { EventListener, EventListenerParams, IEmitter } from './types';

/**
 * @abstract This class is inspired by `NodeJS.EventEmitter`
 *
 * @see Node.JS official docs https://nodejs.org/api/events.html#events_class_eventemitter
 *
 */
export default class Emitter implements IEmitter {
  static readonly DEFAULT_MAX_LISTENERS = 10;

  private _maxListeners;

  private _listeners: Record<string, EventListener[]>;

  constructor() {
    this._maxListeners = Emitter.DEFAULT_MAX_LISTENERS;
    this._listeners = {};
  }

  private _checkMaxListenersLimitReached(eventName: string): void {
    const listenerCount = this._listeners[eventName]?.length || 0;
    if (listenerCount >= this._maxListeners) {
      throw new Error(
        `Maximum number of listeners reached (${this._maxListeners}) for eventName "${eventName}". Failed to add a new listener.`,
      );
    }
  }

  private _onceGenericHandler(
    arrayModificationFn: 'push' | 'unshift',
    eventName: string,
    listener: EventListener,
  ): EventListener {
    this._checkMaxListenersLimitReached(eventName);
    this._ensureListenerArray(eventName);

    const onceWrapper = (...args: EventListenerParams) => {
      this.removeListener(eventName, onceWrapper);
      listener(...args);
    };

    this._listeners[eventName][arrayModificationFn](onceWrapper);
    return onceWrapper;
  }

  private _ensureListenerArray(eventName: string) {
    this._listeners[eventName] = this._listeners[eventName] || [];
  }

  /**
   * @description Alias for `emitter.addListener()`.
   */
  on = this.addListener;

  /**
   * @description Alias for `emitter.removeListener()`.
   */
  off = this.removeListener;

  /**
   *
   * @param eventName The event name
   * @param listener The event handler function
   *
   * @returns a onceWrapper to be used in removeListener function.
   *
   * @throws `Error` when the list of listeners for the specified `eventName`
   * exceeds the length set by `emitter.maxListeners`.
   *
   * @description Adds a **one-time** `listener` function for the event named
   * `eventName`. The next time `eventName` is triggered, this `listener` is
   * removed and then invoked.
   *
   * By default, event listeners are invoked in the order they are added. The
   * `emitter.prependOnceListener()` method can be used as an alternative to
   * add the event listener to the beginning of the listeners array.
   */
  once = this._onceGenericHandler.bind(this, 'push');

  /**
   *
   * @param eventName The event name
   * @param listener The event handler function
   *
   * @returns a onceWrapper to be used in removeListener function.
   *
   * @throws `Error` when the list of listeners for the specified `eventName`
   * exceeds the length set by `emitter.maxListeners`.
   *
   * @description Adds a **one-time** `listener` function for the event named
   * `eventName` to the beginning of the listeners array. The next time
   * `eventName` is triggered, this `listener` is removed, and then invoked.
   */
  prependOnceListener = this._onceGenericHandler.bind(this, 'unshift');

  /**
   *
   * @param eventName The event name
   * @param listener The event handler function
   *
   * @returns a reference to the `Emitter`, so that calls can be chained.
   *
   * @throws `Error` when the list of listeners for the specified `eventName`
   * exceeds the length set by `emitter.maxListeners`.
   *
   * @description Adds the listener function to the end of the listeners
   * array for the event named `eventName`. No checks are made to see if the
   * listener has already been added. Multiple calls passing the same
   * combination of eventName and listener will result in the listener being
   * added, and called, multiple times.
   *
   * By default, event listeners are invoked in the order they are added. The
   * `emitter.prependListener()` method can be used as an alternative to add
   * the event listener to the beginning of the listeners array.
   */
  addListener(eventName: string, listener: EventListener): this {
    this._checkMaxListenersLimitReached(eventName);
    this._ensureListenerArray(eventName);

    this._listeners[eventName].push(listener);
    return this;
  }

  /**
   *
   * @param eventName The event name
   * @param listener The event handler function
   *
   * @returns a reference to the `Emitter`, so that calls can be chained.
   *
   * @description Removes the specified listener from the listener array for
   * the event named `eventName`.
   *
   * `removeListener()` will remove, at most, one instance of a listener from
   * the listener array. If any single listener has been added multiple times
   * to the listener array for the specified `eventName`, then
   * `removeListener()` must be called multiple times to remove each instance.
   *
   * When a single function has been added as a handler multiple times for a
   * single event (as in the example below), removeListener() will remove the
   * most recently added instance.
   */
  removeListener(eventName: string, listener: EventListener): this {
    const listeners = this._listeners[eventName];
    if (!listeners) {
      return this;
    }

    for (let i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        break;
      }
    }

    return this;
  }

  /**
   *
   * @param eventName The event name
   * @param args The list of arguments
   *
   * @returns `true` if the event had listeners, `false` otherwise.
   *
   * @description Synchronously calls each of the listeners registered for
   * the event named `eventName`, in the order they were registered, passing
   * the supplied arguments to each.
   */
  emit(eventName: string, ...args: EventListenerParams): boolean {
    const listeners = this._listeners[eventName];
    if (!listeners) {
      return false;
    }

    listeners.forEach((lis) => {
      lis(...args);
    });

    return true;
  }

  /**
   *
   * @param eventName The event name
   * @param listener The event handler function
   *
   * @returns a reference to the `Emitter`, so that calls can be chained.
   *
   * @throws `Error` when the list of listeners for the specified `eventName`
   * exceeds the length set by `emitter.maxListeners`.
   *
   * @description Adds the `listener` function to the *beginning* of the
   * listeners array for the event named `eventName`. No checks are made to
   * see if the `listener` has already been added. Multiple calls passing
   * the same combination of `eventName` and `listener` will result in the
   * `listener` being added, and called, multiple times.
   */
  prependListener(eventName: string, listener: EventListener): this {
    this._checkMaxListenersLimitReached(eventName);
    this._ensureListenerArray(eventName);

    this._listeners[eventName].unshift(listener);
    return this;
  }

  /**
   *
   * @param eventName
   *
   * @returns a reference to the `Emitter`, so that calls can be chained.
   *
   * @description Removes the specified listener from the listener array for
   * the event named `eventName`.
   *
   * `removeListener()` will remove, at most, one instance of a listener from
   * the listener array. If any single listener has been added multiple times
   * to the listener array for the specified eventName, then removeListener()
   * must be called multiple times to remove each instance.
   */
  removeAllListeners(eventName?: string): this {
    if (eventName) {
      this._listeners[eventName] = [];
    } else {
      this._listeners = {};
    }

    return this;
  }

  /**
   * @returns An array listing the events for which the emitter has registered
   * listeners. The values in the array are strings.
   */
  eventNames(): string[] {
    return Object.keys(this._listeners);
  }

  /**
   *
   * @param eventName The name of the event being listened for
   *
   * @returns The number of listeners listening to the event named `eventName`.
   */
  listenerCount(eventName: string): number {
    return this._listeners[eventName]?.length || 0;
  }

  /**
   *
   * @param eventName The event name
   *
   * @returns A copy of the array of listeners for the event named eventName.
   */
  listeners(eventName: string): EventListener[] {
    this._ensureListenerArray(eventName);
    return [...this._listeners[eventName]];
  }

  /**
   * @returns The current max listener value for the `Emitter` which is
   * either set by `emitter.setMaxListeners(count)` or defaults to
   * `Emitter.DEFAULT_MAX_LISTENERS`.
   */
  getMaxListeners(): number {
    return this._maxListeners;
  }

  /**
   *
   * @param count The new listeners limit
   *
   * @returns a reference to the `Emitter`, so that calls can be chained.
   *
   * @description By default `Emitter` will throw an error if more than 10
   * listeners are added for a particular event. This is a useful default that
   * helps finding memory leaks. The `emitter.setMaxListeners()` method allows
   * the limit to be modified for this specific `Emitter` instance. The value
   * can be set to `Infinity` to indicate an unlimited number of listeners.
   */
  setMaxListeners(count: number): this {
    this._maxListeners = count;
    return this;
  }
}
