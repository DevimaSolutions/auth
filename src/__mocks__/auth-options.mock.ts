import { MemoryStorage } from '../index';

import { getApiMock } from './api.mock';

import type { IAuthOptions } from '../index';

export interface IUser {
  id: number;
  email: string;
  name: string | null;
}

export interface ISignInParams {
  email: string;
}

export const getAuthOptions = (): IAuthOptions<IUser, ISignInParams> => ({
  axiosInstance: getApiMock(),
  signIn: (signInParams, manager) => manager.axios.post('/sign-in', signInParams),
  signOut: async () => {},
  refreshToken: (manager) => manager.axios.post('/refresh', { token: manager.getRefreshToken() }),
  getUser: (manager) => manager.axios.get('/user'),
  buildAuthorizationHeader: (manager) => manager.getAccessToken(),
  storage: new MemoryStorage(),
});
