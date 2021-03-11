import type { Socket } from 'socket.io-client';
import type {
  ISocketClient,
  SocketEventCallback,
  SocketEventUnsubscriber,
} from './socketManager.types';

export default class SocketClient implements ISocketClient {
  private _socket: Socket;

  constructor(socket: Socket) {
    this._socket = socket;
  }

  onMessage<T>(callback: SocketEventCallback<T>): SocketEventUnsubscriber {
    this._socket.on('msg', callback);
    return () => {
      this._socket.off('msg', callback);
    };
  }

  onConnectionError(
    callback: SocketEventCallback<Error>
  ): SocketEventUnsubscriber {
    this._socket.on('connect_error', callback);
    return () => {
      this._socket.off('connect_error', callback);
    };
  }
}
