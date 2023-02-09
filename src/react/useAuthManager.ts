import { getAuthFactory } from './auth-factory';

export const useAuthManager = <
  IUser = { [key: string]: unknown },
  ISignInParams = { [key: string]: unknown },
>() => {
  return getAuthFactory<IUser, ISignInParams>().tryGetAuthManager();
};
