import React, { useEffect, useRef, useState } from 'react';

import { getAuthFactory } from './auth-factory';
import { AuthContextProvider, getDefaultAuthContextValue } from './useAuthContext';

import type {
  IAuthOptions,
  IAuthStorageKeys,
  IDefaultAuthStorageKeys,
  IAuthFactoryOptions,
  IGlobalAuthOptions,
} from '../types';
import type { IAuthContext } from './useAuthContext';
import type { ReactNode } from 'react';

export interface IAuthProviderProps<
  IUser,
  ISignInParams,
  IStorageKeys extends IAuthStorageKeys = IDefaultAuthStorageKeys,
> extends IAuthFactoryOptions {
  children: ReactNode;
  defaultValue: IAuthContext<IUser>;
  config: IAuthOptions<IUser, ISignInParams, IStorageKeys>;
}

function AuthProvider<
  IUser,
  ISignInParams,
  IStorageKeys extends IAuthStorageKeys = IDefaultAuthStorageKeys,
>({
  children,
  defaultValue,
  config,
  refreshTokenOnInit = true,
}: IAuthProviderProps<IUser, ISignInParams, IStorageKeys>) {
  const [value, setValue] = useState<IAuthContext<IUser>>(
    defaultValue ?? getDefaultAuthContextValue(),
  );
  const authFactory = useRef(getAuthFactory<IUser, ISignInParams>());

  useEffect(() => {
    // Keep track of config updates that come form props
    authFactory.current.setGlobalAuthOptions({
      ...config,
      refreshTokenOnInit,
    } as IGlobalAuthOptions<IUser, ISignInParams>);

    let shouldBeDisposed = false;
    // Make sure auth manager is null so it will be reinitialized
    authFactory.current.disposeAuthManager();
    // If configs are changed, auth manager will be reinitialized
    authFactory.current.getAuthManager().then((authManager) => {
      if (shouldBeDisposed) {
        // This condition will be true only if the unmount function was executed before authManager is initialized
        // in this case we need to dispose authManager
        authManager.dispose();
        return;
      }

      // Update initial auth state
      setValue((prev) => ({ ...prev, isLoading: false, ...authManager.getAuthData() }));

      // Update context value on any change in authManager state
      authManager.onStateChanged(() => {
        setValue((prev) => ({ ...prev, ...authManager.getAuthData() }));
      });
    });
    return () => {
      shouldBeDisposed = true;
    };
  }, [config]);

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}

export default AuthProvider;
