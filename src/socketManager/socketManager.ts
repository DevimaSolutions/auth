import type { Socket } from 'socket.io-client';

import type { IAuth } from 'src/types';
import type {
  ISocketManager,
  ISocketClientOptions,
  IO,
} from './socketManager.types';

export default class SocketManager implements ISocketManager {
  private _io: IO;
  private _auth: IAuth;
  private _sockets: Socket[];

  constructor(auth: IAuth) {
    try {
      this._io = require('socket.io-client');
    } catch {
      throw new Error(
        'socket.io-client package is required to use SocketManager instance!'
      );
    }
    this._auth = auth;
    this._sockets = [];
  }

  private _connect(
    socket: Socket,
    socketRoom: string,
    roomId?: string | number
  ) {
    return new Promise<void>((resolve, reject) => {
      socket.connect();

      const errorListener = (err: Error) => {
        this.disconnect(socket);
        reject(err);
      };

      const disconnectListener = () => {
        this.disconnect(socket);
        reject(new Error('disconnect'));
      };

      socket.on('connect_error', errorListener);
      socket.on('disconnect', disconnectListener);

      socket.on('connect', () => {
        const room = roomId ? `/${socketRoom}/${roomId}` : `/${socketRoom}`;
        socket.emit('r', room);

        socket.on('r-connected', () => {
          socket.off('connect_error', errorListener);
          socket.off('disconnect', disconnectListener);
          resolve();
        });
      });
    });
  }

  disconnect(socket: Socket): void {
    socket.disconnect();
    this._sockets = this._sockets.filter((s) => s !== socket);
  }

  disconnectAll() {
    this._sockets.forEach((socket) => {
      socket.disconnect();
    });
    this._sockets = [];
  }

  async createSocketConnection(
    uri: string,
    socketRoom: string,
    roomId?: string | number,
    options?: ISocketClientOptions
  ) {
    const token = await this._auth.getAuthToken();

    const socket = this._io(uri, {
      auth: {
        token,
      },
      withCredentials: true,
      ...options,
    });

    await this._connect(socket, socketRoom, roomId);
    this._sockets.push(socket);

    return socket;
  }
}
