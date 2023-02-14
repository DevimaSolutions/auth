import AuthFactory from '../../auth-factory';

import type { IAuthOptions } from '../..';

const options: IAuthOptions<unknown, unknown> = {
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  getUser: jest.fn(),
};

describe('AuthFactory', () => {
  test(`global options can be set`, () => {
    const authFactory = new AuthFactory();

    expect(authFactory.hasGlobalAuthOptions()).toBeFalsy();

    authFactory.setGlobalAuthOptions(options);

    expect(authFactory.hasGlobalAuthOptions()).toBeTruthy();
  });
  test(`try get auth manager when it is initialized`, async () => {
    const authFactory = new AuthFactory();
    authFactory.setGlobalAuthOptions(options);
    await authFactory.getAuthManager();

    expect(authFactory.tryGetAuthManager).not.toThrowError('AuthManager is not initialized!');
  });
  test(`try get auth manager when it is not initialized`, () => {
    const authFactory = new AuthFactory();

    expect(authFactory.tryGetAuthManager).toThrowError('AuthManager is not initialized!');
  });
  test(`get auth manager when it is initialized`, async () => {
    const authFactory = new AuthFactory();
    authFactory.setGlobalAuthOptions(options);
    await authFactory.getAuthManager();

    const result = await authFactory.getAuthManager();
    expect(result).not.toBeNull();
  });
  test(`get auth manager when it is not initialized`, async () => {
    const authFactory = new AuthFactory();
    authFactory.setGlobalAuthOptions(options);

    const result = await authFactory.getAuthManager();
    expect(result).not.toBeNull();
  });
  test(`get auth manager when options are not set`, () => {
    const authFactory = new AuthFactory();

    expect(authFactory.getAuthManager()).rejects.toThrowError(
      'getAuthManager() method of Auth cannot be called before setAuthOptions(). Options are required to create auth manager.',
    );
  });
  test(`get auth manager when refresh token option is set`, async () => {
    const authFactory = new AuthFactory();
    authFactory.setGlobalAuthOptions({ ...options, refreshTokenOnInit: true });

    await authFactory.getAuthManager();

    expect(options.refreshToken).toBeCalledTimes(1);
  });
  test(`dispose auth manager when initialized`, async () => {
    const authFactory = new AuthFactory();
    authFactory.setGlobalAuthOptions(options);

    await authFactory.getAuthManager();

    expect(authFactory.isAuthManagerInitialized()).toBeTruthy();

    authFactory.disposeAuthManager();

    expect(authFactory.isAuthManagerInitialized()).toBeFalsy();
  });
  test(`dispose auth manager when not initialized`, async () => {
    const authFactory = new AuthFactory();

    expect(authFactory.isAuthManagerInitialized()).toBeFalsy();

    authFactory.disposeAuthManager();

    expect(authFactory.isAuthManagerInitialized()).toBeFalsy();
  });
});
