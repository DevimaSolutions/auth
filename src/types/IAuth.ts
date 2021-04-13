import type { AxiosInstance } from 'axios';
import type { IAuthOptions, IUser } from '.';
import type { ISocketManager } from '../socketManager';

export type AuthCallback = (auth: IAuth) => void | Promise<void>;
export type AuthResponseCallback = (response: Response) => void | Promise<void>;
export type AuthCallbackUnsubscriber = () => void;

export default interface IAuth {
  axios: AxiosInstance;
  options: IAuthOptions;
  socketManager: ISocketManager;
  getUser<User extends IUser>(): Promise<User | null>;
  getAuthToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
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
  onAuthFailed(callback: AuthResponseCallback): AuthCallbackUnsubscriber;
  onPendingStateChanged(callback: AuthCallback): AuthCallbackUnsubscriber;
  oncePendingActionComplete(callback: AuthCallback): AuthCallbackUnsubscriber;
}
