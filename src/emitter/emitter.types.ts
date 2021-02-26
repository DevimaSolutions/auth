export type EventListenerParams = any[];
export type EventListener = (...args: EventListenerParams) => void;

export interface IEmitter {
  addListener(eventName: string, listener: EventListener): this;
  emit(eventName: string, ...args: EventListenerParams): boolean;
  eventNames(): string[];
  getMaxListeners(): number;
  listenerCount(eventName: string): number;
  listeners(eventName: string): EventListener[];
  off(eventName: string, listener: EventListener): this;
  on(eventName: string, listener: EventListener): this;
  once(eventName: string, listener: EventListener): this;
  prependListener(eventName: string, listener: EventListener): this;
  prependOnceListener(eventName: string, listener: EventListener): this;
  removeAllListeners(eventName?: string): this;
  removeListener(eventName: string, listener: EventListener): this;
  setMaxListeners(count: number): this;
}
