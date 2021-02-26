import type {
  EventListener,
  EventListenerParams,
  EventName,
  IEmitter,
} from './emitter.types';

/**
 * @abstract This class is inspired by `NodeJS.EventEmitter`
 * (https://nodejs.org/api/events.html#events_class_eventemitter)
 */
export default class Emitter implements IEmitter {
  addListener(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  emit(_eventName: EventName, ..._args: EventListenerParams): boolean {
    throw new Error('Method not implemented.');
  }
  eventNames(): EventName[] {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  listenerCount(_eventName: EventName): number {
    throw new Error('Method not implemented.');
  }
  listeners(_eventName: EventName): EventListener[] {
    throw new Error('Method not implemented.');
  }
  off(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  on(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  once(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  prependListener(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners(_eventName?: EventName): this {
    throw new Error('Method not implemented.');
  }
  removeListener(_eventName: EventName, _listener: EventListener): this {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(_count: number): this {
    throw new Error('Method not implemented.');
  }
}
