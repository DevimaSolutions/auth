export { default } from './socketManager';
export { default as SocketClient } from './socketClient';

export type {
  ISocketManager,
  ISocketClientOptions,
  ISocketClient,
  SocketEventCallback,
  SocketEventUnsubscriber,
} from './socketManager.types';
