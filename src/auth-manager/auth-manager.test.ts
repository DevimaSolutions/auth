import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { MemoryStorage } from '../storage';

import AuthManager from './auth-manager';

import type { IAuthOptions, ISignedInOptions } from '../types';

const updatedAuthData = { accessToken: 'valid-token', refreshToken: 'valid-refresh-token' };
const getAxiosMock = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });

  mock.onPost('/sign-in').reply((config) => {
    const { email } = JSON.parse(config.data);

    return email === 'error@example.com'
      ? [400, { message: 'email not found' }]
      : [200, { ...updatedAuthData }];
  });
  mock.onPost('/refresh').reply((config) => {
    const { refreshToken } = JSON.parse(config.data);

    return refreshToken === 'invalid-token'
      ? [400, { message: 'not valid refresh token' }]
      : [200, { ...updatedAuthData }];
  });
  mock.onGet('/user').reply(200, { id: 1 });

  return instance;
};

const getOptions = (): IAuthOptions<{ id: number }, { email: string }> => ({
  axiosInstance: getAxiosMock(),
  signIn: jest.fn(async (data, manager) => manager.axios.post('/sign-in', data)),
  signOut: jest.fn(async () => {}),
  refreshToken: jest.fn(async (manager) =>
    manager.axios.post('/refresh', { refreshToken: manager.getRefreshToken() }),
  ),
  getUser: jest.fn(async (manager) => manager.axios.get('/user')),
  storage: new MemoryStorage(),
});

const signInOptions: ISignedInOptions<true, { id: number }> = {
  isSignedIn: true,
  accessToken: 'test-access',
  refreshToken: 'test-refresh',
  user: { id: 1 },
};

describe('AuthManager', () => {
  test('Can create auth manager', () => {
    expect(() => {
      new AuthManager(getOptions());
    }).not.toThrowError();
  });
  test('Can get options', () => {
    const manager = new AuthManager(getOptions());

    const actualResult = manager.options;

    expect(actualResult).toMatchSnapshot();
  });
  test('Can get axios instance', () => {
    const options = getOptions();
    const manager = new AuthManager(options);

    const actualResult = manager.axios;

    expect(actualResult).toBe(options.axiosInstance);
  });
  test('Should sign in on init', () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    expect(manager.isSignedIn()).toBeTruthy();
  });
  test('Can get empty auth header when unauthorized', () => {
    const manager = new AuthManager(getOptions());
    expect(manager.getAuthorizationHeader()).toBeNull();
  });
  test('Can get auth header when authorized', () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    expect(manager.getAuthorizationHeader()).toBe(`Bearer ${signInOptions.accessToken}`);
  });
  test('Can get empty user when unauthorized', () => {
    const manager = new AuthManager(getOptions());
    expect(manager.getUser()).toBeNull();
  });
  test('Can get user when authorized', () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    expect(manager.getUser()).toEqual({ id: 1 });
  });
  test('Can get empty refresh token when unauthorized', () => {
    const manager = new AuthManager(getOptions());
    expect(manager.getRefreshToken()).toBeNull();
  });
  test('Can get refresh token when authorized', () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    expect(manager.getRefreshToken()).toBe(signInOptions.refreshToken);
  });
  test('Can set auth after init', () => {
    const manager = new AuthManager(getOptions());
    expect(manager.isSignedIn()).toBeFalsy();

    manager.setAuth(signInOptions.user, {
      accessToken: signInOptions.accessToken,
      refreshToken: signInOptions.refreshToken,
    });

    expect(manager.isSignedIn()).toBeTruthy();
  });
  test('Should update user data', () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    const initialUser = manager.getUser();
    const updatedUser = {
      id: 2,
    };

    manager.updateUser(updatedUser);

    expect(initialUser).toEqual(signInOptions.user);
    expect(manager.getUser()).toEqual(updatedUser);
  });
  test('Should call sign in request', async () => {
    const options = getOptions();
    const manager = new AuthManager(options);

    expect(manager.isSignedIn()).toBeFalsy();
    await manager.signIn({ email: 'john@example.com' });
    expect(options.signIn).toBeCalled();
    expect(manager.isSignedIn()).toBeTruthy();
  });
  test('Should not call sign in request when signed in', async () => {
    const options = getOptions();
    const manager = new AuthManager(options, signInOptions);

    await manager.signIn({ email: 'john@example.com' });
    expect(options.signIn).not.toBeCalled();
  });
  test('Should emit event when sign in request failed', async () => {
    const options = getOptions();
    const manager = new AuthManager(options);
    const signInFailedHandler = jest.fn();
    const errorHandler = jest.fn();
    manager.onSignInFailed(signInFailedHandler);

    await manager.signIn({ email: 'error@example.com' }).catch(errorHandler);
    expect(signInFailedHandler).toBeCalled();
    expect(errorHandler).toBeCalled();
  });
  test('Should sign out only when signed in', async () => {
    const options = getOptions();
    const manager = new AuthManager(options);
    await manager.signOut();

    expect(options.signOut).not.toBeCalled();

    manager.setAuth(signInOptions.user, {
      accessToken: signInOptions.accessToken,
      refreshToken: signInOptions.refreshToken,
    });
    await manager.signOut();

    expect(options.signOut).toBeCalled();
  });
  test('Should refresh token', async () => {
    const options = getOptions();
    const manager = new AuthManager(options, signInOptions);
    await manager.refreshToken();

    expect(manager.getAccessToken()).toBe(updatedAuthData.accessToken);
    expect(manager.getRefreshToken()).toBe(updatedAuthData.refreshToken);
  });
  test('Should sign out on invalid refresh token', async () => {
    const options = getOptions();
    const manager = new AuthManager(options, signInOptions);
    await manager.refreshToken('invalid-token');

    expect(manager.isSignedIn()).toBeFalsy();
  });
  test('Should throw error on manager modifications after dispose', async () => {
    const manager = new AuthManager(getOptions());
    manager.dispose();
    await expect(manager.refreshToken()).rejects.toThrow('Instance was disposed');
  });
  test('Should return wether instance is disposed', async () => {
    const manager = new AuthManager(getOptions());
    expect(manager.isDisposed()).toBeFalsy();
    manager.dispose();
    expect(manager.isDisposed()).toBeTruthy();
  });
  test('Should unsubscribe from event', async () => {
    const manager = new AuthManager(getOptions(), signInOptions);
    const handleSignedOut = jest.fn();
    const unsubscribe = manager.onSignedOut(handleSignedOut);
    unsubscribe();
    await manager.signOut();

    expect(handleSignedOut).not.toBeCalled();
  });
});
