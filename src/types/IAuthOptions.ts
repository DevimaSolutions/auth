import type { IAuthResult, IUser } from './IUser';

export default interface IAuthOptions {
  signIn(email: string, password: string): Promise<IAuthResult>;
  signOut(authToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<IAuthResult>;
  getUser(authToken: string): Promise<IUser>;
}
