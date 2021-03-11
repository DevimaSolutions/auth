import { io, Socket } from 'socket.io-client';

import type { IAuth } from 'src/types';
import type {
  ISocketManager,
  ISocketClientOptions,
} from './socketManager.types';

export default class SocketManager implements ISocketManager {
  private _auth: IAuth;
  private _sockets: Socket[];
  private readonly _eventList: string[];

  constructor(auth: IAuth) {
    this._auth = auth;
    this._sockets = [];
    this._eventList = [
      'connect_error',
      'connect',
      'disconnect',
      'room-connected',
      'msg',
    ];
  }

  private _connect(socket: Socket, socketRoom: string, roomId?: string) {
    return new Promise<void>((resolve, reject) => {
      console.log('connect');
      socket.connect();

      socket.on('connect_error', (err: Error) => {
        console.log('connect_error');
        this.disconnect(socket);
        reject(err);
      });

      socket.on('connect', () => {
        const room = roomId ? `${socketRoom}/${roomId}` : socketRoom;
        socket.emit('room', room);

        socket.on('room-connected', () => {
          resolve();
        });
      });

      socket.on('disconnect', () => {
        this.disconnect(socket);
        console.log('disconnect');
        reject(new Error('disconnect'));
      });
    });
  }

  disconnect(socket: Socket) {
    this._eventList.forEach((eventName) => {
      socket.off(eventName);
    });
    this._sockets = this._sockets.filter((s) => s !== socket);
  }

  disconnectAll() {
    this._sockets.forEach((socket) => {
      this._eventList.forEach((eventName) => {
        socket.off(eventName);
      });
    });
    this._sockets = [];
  }

  async createSocketConnection(
    uri: string,
    socketRoom: string,
    roomId?: string,
    options?: ISocketClientOptions
  ) {
    const token = await this._auth.getAuthToken();

    const socket = io(uri, {
      auth: {
        token,
      },
      withCredentials: true,
      ...options,
    });

    socket.onAny((event, ...args) => {
      console.log(event, args);
    });
    console.log({ socket });

    await this._connect(socket, socketRoom, roomId);
    this._sockets.push(socket);
    return socket;
  }
}
