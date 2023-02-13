import AuthFactory from '../auth-factory';

import type { IAuthManager } from '../types';

// Such a structure with a getter is mostly needed to ensure TS types are properly casted
// to AuthFactory in the user application
const authFactory = new AuthFactory<unknown, unknown>();

export const getAuthFactory = <IUser, ISignInParams>() =>
  authFactory as AuthFactory<IUser, ISignInParams>;

export const getAuthManager = <IUser, ISignInParams>() =>
  authFactory.getAuthManager() as Promise<IAuthManager<IUser, ISignInParams>>;
