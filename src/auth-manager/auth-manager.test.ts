import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { MemoryStorage } from '../storage';

import AuthManager from './auth-manager';

import type { IAuthOptions, ISignedInOptions } from '../types';

const getAxiosMock = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });
  mock.onGet('/sign-in').reply(200, { token: 'valid-token' });
  mock.onGet('/refresh').reply(200, { token: 'valid-token' });
  mock.onGet('/user').reply(200, { id: 1 });
  return instance;
};

const getOptions = (): IAuthOptions<{ id: number }, { token: string }> => ({
  axiosInstance: getAxiosMock(),
  signIn: jest.fn(async () => getAxiosMock().get('/sign-in')),
  signOut: jest.fn(async () => {}),
  refreshToken: jest.fn(async () => getAxiosMock().get('/refresh')),
  getUser: jest.fn(async () => getAxiosMock().get('/user')),
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
});
