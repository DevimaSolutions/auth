import AuthManager from './auth-manager';

import type { IAuthManager, IAuthOptions, IGlobalAuthOptions, ISignedInOptions } from './types';

export default class AuthFactory<IUser, ISignInParams> {
  /**
   * @param options `IAuthOptions` to initialize `authManager`.
   * @returns initialized `IAuthManager` instance.
   */
  static createAuthManagerInstance<IUser, ISignInParams>(
    authOptions: IAuthOptions<IUser, ISignInParams>,
  ): IAuthManager<IUser, ISignInParams>;

  /**
   * Hydrates `authManager` instance with predefined state to avoid async initialization
   * @param options `IAuthOptions` to initialize `auth`.
   * @param signedInOptions is the user signed in during hydration.
   * @returns initialized `IAuthManager` instance.
   */
  static createAuthManagerInstance<IUser, ISignInParams, IsSignedIn extends boolean>(
    authOptions: IAuthOptions<IUser, ISignInParams>,
    signedInOptions: ISignedInOptions<IsSignedIn, IUser>,
  ): IAuthManager<IUser, ISignInParams>;

  static createAuthManagerInstance<IUser, ISignInParams, IsSignedIn extends boolean>(
    authOptions: IAuthOptions<IUser, ISignInParams>,
    signedInOptions?: ISignedInOptions<IsSignedIn, IUser>,
  ): IAuthManager<IUser, ISignInParams> {
    return new AuthManager(authOptions, signedInOptions);
  }

  // Singleton to use in any part of your project
  private _instance: IAuthManager<IUser, ISignInParams> | null = null;

  private _options: IGlobalAuthOptions<IUser, ISignInParams> | null = null;

  /**
   * Set options that will be used to create a singleton instance of AuthManager accessible
   * using getAuthManager method
   * @param authOptions options used to initialize AuthManager
   */
  setGlobalAuthOptions = (authOptions: IGlobalAuthOptions<IUser, ISignInParams> | null) => {
    this._options = authOptions;
  };

  /**
   * @returns `true` when global options are set.
   * `false` otherwise.
   */
  hasGlobalAuthOptions = () => !!this._options;

  /**
   * @returns `true` when AuthManager singleton is initialized.
   * `false` otherwise.
   */
  isAuthManagerInitialized = () => !!this._instance;

  /**
   * Try to get singleton instance of AuthManager without waiting for initialization.
   * When AuthManager is not yet initialized this method will thor an error
   * @throws `new Error('AuthManager is not initialized!');`
   * @returns instance of AuthManager
   */
  tryGetAuthManager = () => {
    if (!this._instance) {
      throw new Error('AuthManager is not initialized!');
    }
    return this._instance;
  };

  /**
   * Return singleton instance of AuthManager if exist.
   * Otherwise it will try to create new instance using global options.
   * Global options must be set before calling this method using setGlobalAuthOptions()
   * @returns instance of AuthManager
   */
  getAuthManager = async () => {
    if (this._instance) {
      return this._instance;
    }

    if (!this._options) {
      throw new Error(
        'getAuthManager() method of Auth cannot be called before setAuthOptions(). Options are required to create auth manager.',
      );
    }

    const { refreshTokenOnInit, ...options } = this._options;

    this._instance = AuthFactory.createAuthManagerInstance(options);

    if (refreshTokenOnInit) {
      // If there is a refresh token, the user might be authorized.
      // Try to refresh token to get up to date information about the user
      await this._instance.refreshToken();
    }

    return this._instance;
  };

  /**
   * @description Removes all active event listeners on AuthManager object.
   * Remove response interceptor that refreshes token from axios instance.
   * AuthManager instance should not be used after disposing!
   * The next call to getAuthManager will try to create a new instance.
   */
  disposeAuthManager = () => {
    if (this._instance) {
      this._instance.dispose();
      this._instance = null;
    }
  };
}
