import { getAuthFactory } from './auth-factory';
import { useAuthContext } from './useAuthContext';

/**
 * Allow you to use `AuthManager` instance in React rendering pipeline
 *
 * **Note:** It is more preferably to use `useAuthContext` to display auth data in React rendering pipeline
 * and `getAuthManager` function when you need to manipulate authorization state
 * @returns Globally initialized auth manager instance or null if it is not initialized
 */
export const useAuthManager = <
  IUser = { [key: string]: unknown },
  ISignInParams = { [key: string]: unknown },
>() => {
  const { isLoading } = useAuthContext<IUser>();

  if (isLoading) {
    return null;
  }

  return getAuthFactory<IUser, ISignInParams>().tryGetAuthManager();
};
