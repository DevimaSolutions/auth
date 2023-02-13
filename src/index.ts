export { default } from './auth-factory';
export { default as AuthManager } from './auth-manager';
export { defaultAuthStorageKeys, AuthEventNames } from './constants';
export { default as Emitter } from './emitter';
export { LocalStorage, MemoryStorage } from './storage';

export type { EventListener, EventListenerParams, IEmitter } from './emitter';
export type { IStorage } from './storage';
export type {
  IAuthManager,
  AuthCallback,
  AuthCallbackUnsubscriber,
  AuthResponseCallback,
  IAuthOptions,
  IAuthResult,
  ISignedInOptions,
} from './types';
