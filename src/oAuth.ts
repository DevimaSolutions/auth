import Auth from './auth';
import type { IAuth, IAuthOptions } from './types';

/**
 * @param options `IAuthOptions` to initialize `oAuth`.
 * @returns initialized `IAuth` instance.
 * If `oAuth` was initilized before the old instance id disposed.
 */
function oAuth(options: IAuthOptions): IAuth;

/**
 * Hydrates `oAuth` instance with predefined state to avoid async initialization
 * @param options `IAuthOptions` to initialize `oAuth`.
 * @param isSignedIn is the user signed in during hydration.
 * @returns initialized `IAuth` instance.
 * If `oAuth` was initilized before the old instance id disposed.
 */
function oAuth(options: IAuthOptions, isSignedIn: boolean): IAuth;

/**
 * @returns `IAuth` instance if `oAuth` has been initialized with `IAuthOptions` before.
 * @throws `Error` when called before `oAuth` is initialized with `IAuthOptions`.
 */
function oAuth(): IAuth;
function oAuth(options?: IAuthOptions, isSignedIn?: boolean): IAuth {
  if (!options) {
    return Auth.getInstance();
  }

  if (typeof isSignedIn !== 'undefined') {
    return Auth.hydrate(options, isSignedIn);
  }

  return Auth.initialize(options);
}

export default oAuth;
