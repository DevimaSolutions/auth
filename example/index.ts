import { getAuthManager } from './auth-manager';

console.log('start');
getAuthManager().then((authManager) => {
  (window as any).authManager = authManager;
  console.log({ isSignedIn: authManager.isSignedIn() });
  console.log(authManager);
  authManager.onStateChanged((auth) => {
    console.log(auth.getUser(), auth.getAccessToken(), auth.getRefreshToken());
  });
});
