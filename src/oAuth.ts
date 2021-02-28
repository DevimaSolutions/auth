import Auth from './auth';
import type { IAuth, IAuthOptions } from './types';

/**
 * @param options `IAuthOptions` to initialize `oAuth`.
 * @returns initialized `IAuth` instance.
 * If `oAuth` was initilized before the old instance id disposed.
 */
function oAuth(options: IAuthOptions): IAuth;

/**
 * @returns `IAuth` instance if `oAuth` has been initialized with `IAuthOptions` before.
 * @throws `Error` when called before `oAuth` is initialized with `IAuthOptions`.
 */
function oAuth(): IAuth;
function oAuth(options?: IAuthOptions): IAuth {
  return options ? Auth.initialize(options) : Auth.getInstance();
}

export default oAuth;
