export enum AuthEventName {
  onAuthFailed = 'onAuthFailed',
  OnAuthStateChanged = 'onAuthStateChanged',
  OnSignedIn = 'onSignedIn',
  OnSignedOut = 'onSignedOut',
  OnTokenRefreshed = 'onTokenRefreshed',
  OnUserChanged = 'onUserChanged',
  OnPendingActionComplete = 'onPendingActionComplete',
}

export enum AuthStorageKey {
  AuthData = '@o-auth/authData',
  AuthToken = '@o-auth/authToken',
  RefreshToken = '@o-auth/refreshToken',
  User = '@o-auth/user',
}
