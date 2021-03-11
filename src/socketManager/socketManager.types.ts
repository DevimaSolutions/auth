import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

export type ISocketClientOptions = Partial<ManagerOptions & SocketOptions>;

export type SocketEventCallback<T> = (data: T) => void | Promise<void>;
export type SocketEventUnsubscriber = () => void | Promise<void>;

export interface ISocketClient {
  onMessage<T>(callback: SocketEventCallback<T>): SocketEventUnsubscriber;

  onConnectionError(
    callback: SocketEventCallback<Error>
  ): SocketEventUnsubscriber;
}

export interface ISocketManager {
  createSocketConnection(
    uri: string,
    socketRoom: string,
    roomId?: string,
    options?: ISocketClientOptions
  ): Promise<Socket>;

  disconnect(socket: Socket): void;

  disconnectAll(): void;
}
