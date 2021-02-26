import type { IAuthUser } from 'src/authBase';
import type { IUserBase } from '.';

export type AuthCallback<IUser extends IUserBase> = (
  auth: IAuth<IUser>
) => void;
export type AuthCallbackUnsubscriber = () => void;

export default interface IAuth<IUser extends IUserBase = IAuthUser> {
  getUser(): Promise<IUser>;
  getAuthToken(): Promise<string>;
  updateUser(user: Partial<IUser>): Promise<this>;
  isPending(): boolean;
  isSignedIn(): boolean;

  signIn(email: string, password: string): Promise<this>;
  signOut(): Promise<this>;
  refreshToken(token: string): Promise<this>;

  onSignedIn(callback: AuthCallback<IUser>): AuthCallbackUnsubscriber;
  onSignedOut(callback: AuthCallback<IUser>): AuthCallbackUnsubscriber;
  onTokenRefreshed(callback: AuthCallback<IUser>): AuthCallbackUnsubscriber;
  onUserChanged(callback: AuthCallback<IUser>): AuthCallbackUnsubscriber;
  onAuthStateChanged(callback: AuthCallback<IUser>): AuthCallbackUnsubscriber;
}
