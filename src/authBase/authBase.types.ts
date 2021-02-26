export interface IAuthUser {
  role: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  image: {
    original_name: string;
    path: string;
    id: string;
  };
  id: string;
}

export interface IAuthLoginResult extends IAuthUser {
  auth_token: string;
  refresh_token: string;
}

export enum AuthEventName {
  onAuthStateChanged = 'onAuthStateChanged',
  onSignedIn = 'onSignedIn',
  onSignedOut = 'onSignedOut',
  onTokenRefreshed = 'onTokenRefreshed',
  onUserChanged = 'onUserChanged',
}
