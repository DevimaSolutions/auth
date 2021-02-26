export type EventListenerParams = any[];
export type EventListener = (...args: EventListenerParams) => void;
export type EventName = string | symbol;

export interface IEmitter {
  addListener(eventName: EventName, listener: EventListener): this;
  emit(eventName: EventName, ...args: EventListenerParams): boolean;
  eventNames(): EventName[];
  getMaxListeners(): number;
  listenerCount(eventName: EventName): number;
  listeners(eventName: EventName): EventListener[];
  off(eventName: EventName, listener: EventListener): this;
  on(eventName: EventName, listener: EventListener): this;
  once(eventName: EventName, listener: EventListener): this;
  prependListener(eventName: EventName, listener: EventListener): this;
  prependOnceListener(eventName: EventName, listener: EventListener): this;
  removeAllListeners(eventName?: EventName): this;
  removeListener(eventName: EventName, listener: EventListener): this;
  setMaxListeners(count: number): this;
}
