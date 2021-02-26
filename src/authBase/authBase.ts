import { Emitter, IEmitter } from 'src/emitter';
import type {
  IAuth,
  AuthCallback,
  AuthCallbackUnsubscriber,
  IAuthOptions,
  IUser,
} from 'src/types';
import { AuthEventName } from './authBase.types';

export default class AuthBase implements IAuth {
  private _emitter: IEmitter;

  protected readonly _options: IAuthOptions;

  get options(): IAuthOptions {
    return this._options;
  }

  protected constructor(options: IAuthOptions) {
    this._options = options;
    this._emitter = new Emitter();
    // TODO call refresh token here
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

  dispose = () => {
    this._emitter.removeAllListeners();
  };

  getUser<User extends IUser>(): Promise<User> {
    throw new Error('Method not implemented.');
  }
  getAuthToken(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  updateUser<User extends IUser>(_user: Partial<User>): Promise<this> {
    throw new Error('Method not implemented.');
  }
  isPending(): boolean {
    throw new Error('Method not implemented.');
  }
  isSignedIn(): boolean {
    throw new Error('Method not implemented.');
  }
  signIn(_email: string, _password: string): Promise<this> {
    throw new Error('Method not implemented.');
  }
  signOut(): Promise<this> {
    throw new Error('Method not implemented.');
  }
  refreshToken(_token: string): Promise<this> {
    throw new Error('Method not implemented.');
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
}
