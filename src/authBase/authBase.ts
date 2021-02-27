import { Emitter, IEmitter } from '../emitter';
import { IStorage, Storage } from '../storage';
import type {
  IAuth,
  AuthCallback,
  AuthCallbackUnsubscriber,
  IAuthOptions,
  IUser,
} from 'src/types';
import { AuthEventName } from './authBase.types';

export default class AuthBase implements IAuth {
  private _pendingPromise: Promise<void> | null;
  private _isSignedIn: boolean;
  private readonly _emitter: IEmitter;
  private readonly _storage: IStorage;
  protected readonly _options: IAuthOptions;

  get options(): IAuthOptions {
    return this._options;
  }

  protected constructor(options: IAuthOptions) {
    this._pendingPromise = null;
    this._isSignedIn = false;
    this._emitter = new Emitter();
    this._storage = new Storage();
    this._options = options;

    this._tryRefreshOnInit();
  }

  private async _tryRefreshOnInit(): Promise<void> {
    const refreshToken = await this._storage.getString('refreshToken');
    if (!refreshToken) {
      return;
    }

    await this.refreshToken(refreshToken);
  }

  private _createSubscription(
    eventName: AuthEventName,
    callback: AuthCallback
  ): AuthCallbackUnsubscriber {
    this._emitter.addListener(eventName, callback);

    return () => {
      this._emitter.removeListener(eventName, callback);
    };
  }

  dispose() {
    this._emitter.removeAllListeners();
  }

  getUser<User extends IUser>(): Promise<User> {
    return this._storage.getItem<User>('user');
  }
  getAuthToken(): Promise<string> {
    return this._storage.getString('authToken');
  }
  updateUser<User extends IUser>(_user: Partial<User>): Promise<this> {
    throw new Error('Method not implemented.');
  }
  isPending(): boolean {
    return Boolean(this._pendingPromise);
  }
  isSignedIn(): boolean {
    return this._isSignedIn;
  }
  async signIn(email: string, password: string): Promise<this> {
    if (this.isPending()) {
      await this._pendingPromise;

      if (this._isSignedIn) {
        return this;
      }
    }

    this._pendingPromise = new Promise(async (resolve) => {
      const authResult = await this._options.signIn(email, password);
      const { auth_token, refresh_token, ...authData } = authResult;

      const user = await this._options.getUser();
      await this._storage.multiSet({
        authToken: auth_token,
        refreshToken: refresh_token,
        authData: authData,
        user: user,
      });

      this._isSignedIn = true;
      resolve();
    });

    await this._pendingPromise;
    this._pendingPromise = null;

    return this;
  }
  async signOut(): Promise<this> {
    if (this.isPending()) {
      await this._pendingPromise;

      if (!this._isSignedIn) {
        return this;
      }
    }

    this._pendingPromise = new Promise(async (resolve) => {
      await this._options.signOut();
      await this._storage.multiRemove([
        'authToken',
        'refreshToken',
        'authData',
        'user',
      ]);

      this._isSignedIn = false;
      resolve();
    });

    await this._pendingPromise;
    this._pendingPromise = null;

    return this;
  }
  async refreshToken(token: string): Promise<this> {
    if (this.isPending()) {
      await this._pendingPromise;

      if (this._isSignedIn) {
        return this;
      }
    }

    // TODO: emit events
    // TODO: refactor decrease code duplication
    // TODO: hadle api errors. Eg invalid credentials
    // TODO: move async storage to peer dependecies
    this._pendingPromise = new Promise(async (resolve) => {
      const authResult = await this._options.refreshToken(token);
      const { auth_token, refresh_token, ...authData } = authResult;

      const user = await this._options.getUser();
      await this._storage.multiSet({
        authToken: auth_token,
        refreshToken: refresh_token,
        authData: authData,
        user: user,
      });

      this._isSignedIn = true;
      resolve();
    });

    await this._pendingPromise;
    this._pendingPromise = null;

    return this;
  }

  onSignedIn(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onSignedIn, callback);
  }
  onSignedOut(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onSignedOut, callback);
  }
  onTokenRefreshed(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onTokenRefreshed, callback);
  }
  onUserChanged(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onUserChanged, callback);
  }
  onAuthStateChanged(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onAuthStateChanged, callback);
  }
  onAuthFailed(callback: AuthCallback): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onAuthStateChanged, callback);
  }
}
