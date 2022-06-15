import AuthManager from './auth-manager';

import type { IAuthManager, IAuthOptions, ISignedInOptions } from './types';

/**
 * @param options `IAuthOptions` to initialize `authManager`.
 * @returns initialized `IAuthManager` instance.
 */
function initAuth<IUser, SignInParams>(
  authOptions: IAuthOptions<IUser, SignInParams>,
): IAuthManager<IUser, SignInParams>;

/**
 * Hydrates `authManager` instance with predefined state to avoid async initialization
 * @param options `IAuthOptions` to initialize `auth`.
 * @param signedInOptions is the user signed in during hydration.
 * @returns initialized `IAuthManager` instance.
 */
function initAuth<IUser, SignInParams, IsSignedIn extends boolean>(
  authOptions: IAuthOptions<IUser, SignInParams>,
  signedInOptions: ISignedInOptions<IsSignedIn, IUser>,
): IAuthManager<IUser, SignInParams>;

function initAuth<IUser, SignInParams, IsSignedIn extends boolean>(
  authOptions: IAuthOptions<IUser, SignInParams>,
  signedInOptions?: ISignedInOptions<IsSignedIn, IUser>,
): IAuthManager<IUser, SignInParams> {
  return new AuthManager(authOptions, signedInOptions);
}

export default {
  initAuth,
};
