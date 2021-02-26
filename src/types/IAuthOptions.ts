import type { IAuthResult, IUser } from './IUser';

export default interface IAuthOptions {
  signIn(email: string, password: string): Promise<IAuthResult>;
  signOut(): Promise<void>;
  refreshToken(refreshToken: string): Promise<IAuthResult>;
  getUser(): Promise<IUser>;
}
