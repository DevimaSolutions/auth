import Auth from './auth';
import type { IAuth, IAuthOptions, ISignedInOptions } from './types';

/**
 * @param options `IAuthOptions` to initialize `oAuth`.
 * @returns initialized `IAuth` instance.
 * If `oAuth` was initilized before the old instance id disposed.
 */
function oAuth(options: IAuthOptions): IAuth;

/**
 * Hydrates `oAuth` instance with predefined state to avoid async initialization
 * @param options `IAuthOptions` to initialize `oAuth`.
 * @param signedInOptions is the user signed in during hydration.
 * @returns initialized `IAuth` instance.
 * If `oAuth` was initilized before the old instance id disposed.
 */
function oAuth(options: IAuthOptions, signedInOptions: ISignedInOptions): IAuth;

/**
 * @returns `IAuth` instance if `oAuth` has been initialized with `IAuthOptions` before.
 * @throws `Error` when called before `oAuth` is initialized with `IAuthOptions`.
 */
function oAuth(): IAuth;
function oAuth(
  options?: IAuthOptions,
  signedInOptions?: ISignedInOptions
): IAuth {
  if (!options) {
    return Auth.getInstance();
  }

  if (typeof signedInOptions !== 'undefined') {
    return Auth.hydrate(options, signedInOptions);
  }

  return Auth.initialize(options);
}

export default oAuth;
