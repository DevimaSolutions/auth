import { Emitter, IEmitter } from 'src/emitter';
import type {
  IAuth,
  AuthCallback,
  AuthCallbackUnsubscriber,
  IAuthOptions,
} from 'src/types';
import { AuthEventName, IAuthUser } from './authBase.types';

/**
 * @abstract IAuthUser implementation for generic IUser parameter is hardcoded here for now.
 * It can be refactored in next versions to have more flexible way to store user information.
 */
export default class AuthBase implements IAuth<IAuthUser> {
  private _emitter: IEmitter;

  protected readonly _options: IAuthOptions;

  get options(): IAuthOptions {
    return this._options;
  }

  constructor(options: IAuthOptions) {
    this._options = options;
    this._emitter = new Emitter();
    // TODO call refresh token here
  }

  private _createSubscription(
    eventName: AuthEventName,
    callback: AuthCallback<IAuthUser>
  ) {
    this._emitter.addListener(eventName, callback);

    return () => {
      this._emitter.removeListener(eventName, callback);
    };
  }

  protected dispose = () => {
    this._emitter.removeAllListeners();
  };

  getUser(): Promise<IAuthUser> {
    throw new Error('Method not implemented.');
  }
  getAuthToken(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  updateUser(_user: Partial<IAuthUser>): Promise<this> {
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

  onSignedIn(callback: AuthCallback<IAuthUser>): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onSignedIn, callback);
  }
  onSignedOut(callback: AuthCallback<IAuthUser>): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onSignedOut, callback);
  }
  onTokenRefreshed(
    callback: AuthCallback<IAuthUser>
  ): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onTokenRefreshed, callback);
  }
  onUserChanged(callback: AuthCallback<IAuthUser>): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onUserChanged, callback);
  }
  onAuthStateChanged(
    callback: AuthCallback<IAuthUser>
  ): AuthCallbackUnsubscriber {
    return this._createSubscription(AuthEventName.onAuthStateChanged, callback);
  }
}
