import type { IUser } from './IUser';

export type AuthCallback = (auth: IAuth) => void;
export type AuthCallbackUnsubscriber = () => void;

export default interface IAuth {
  getUser<User extends IUser>(): Promise<User>;
  getAuthToken(): Promise<string>;
  updateUser<User extends IUser>(user: Partial<User>): Promise<this>;
  isPending(): boolean;
  isSignedIn(): boolean;

  signIn(email: string, password: string): Promise<this>;
  signOut(): Promise<this>;
  refreshToken(token: string): Promise<this>;

  onSignedIn(callback: AuthCallback): AuthCallbackUnsubscriber;
  onSignedOut(callback: AuthCallback): AuthCallbackUnsubscriber;
  onTokenRefreshed(callback: AuthCallback): AuthCallbackUnsubscriber;
  onUserChanged(callback: AuthCallback): AuthCallbackUnsubscriber;
  onAuthStateChanged(callback: AuthCallback): AuthCallbackUnsubscriber;
}
