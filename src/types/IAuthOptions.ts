import type { AxiosInstance, AxiosResponse } from 'axios';
import type { IStorage } from 'src/storage';
import type { IAuthResult, IUser } from './IUser';
export default interface IAuthOptions {
  axiosInstance?: AxiosInstance;
  storage?: IStorage;
  signIn(email: string, password: string): Promise<AxiosResponse<IAuthResult>>;
  signOut(authToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AxiosResponse<IAuthResult>>;
  getUser(authToken: string): Promise<AxiosResponse<IUser>>;
}
