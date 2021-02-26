import { Auth } from './auth';
import type { IAuthUser } from './authBase';
import type { IAuth, IAuthOptions, IUserBase } from './types';

/**
 * @param options IAuthOptions to initialize Auth class.
 * @returns initialized Auth instance.
 * If Auth was initilized before the old instance id disposed.
 */
function oAuth<IUser extends IUserBase = IAuthUser>(
  options: IAuthOptions
): IAuth<IAuthUser>;

/**
 * @returns Auth instance if Auth has been initialized with IAuthOptions before.
 * @throws `Error` when called before Auth is initialized with IAuthOptions.
 */
function oAuth(): IAuth<IAuthUser>;
function oAuth(options?: IAuthOptions): IAuth<IAuthUser> {
  return options ? Auth.initialize(options) : Auth.getInstance();
}

export default oAuth;
