import { createContext, useContext } from 'react';

export interface IAuthContext<IUser = { [key: string]: unknown }> {
  isLoading: boolean;
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isSignedIn: boolean;
}

export const getDefaultAuthContextValue = () => {
  return {
    isLoading: true,
    user: null,
    accessToken: null,
    refreshToken: null,
    isSignedIn: false,
  };
};

export const AuthContext = createContext<IAuthContext<unknown>>(getDefaultAuthContextValue());

export const AuthContextProvider = AuthContext.Provider;

export const useAuthContext = <IUser = { [key: string]: unknown }>() => {
  return useContext(AuthContext) as IAuthContext<IUser>;
};
