import { ensureAuthOptions } from '../ensure-auth-options';

import type { IAuthManager, IAuthOptions } from '../..';
import type { AxiosResponse } from 'axios';

const options: IAuthOptions<unknown, unknown> = {
  signIn: async () =>
    ({
      data: {
        accessToken: 'test',
        refreshToken: 'test',
      },
    } as AxiosResponse),
  refreshToken: async () =>
    ({
      data: {
        accessToken: 'test',
        refreshToken: 'test',
      },
    } as AxiosResponse),
  getUser: async () =>
    ({
      data: {
        id: 'test',
        email: 'test@mail.com',
      },
    } as AxiosResponse),
};

const buildAuthorizationHeaderTestCases = [
  {
    manager: {
      getAccessToken: () => 'test',
    } as IAuthManager<unknown, unknown>,
    expected: 'Bearer test',
  },
  {
    manager: {
      getAccessToken: () => null,
    } as IAuthManager<unknown, unknown>,
    expected: null,
  },
];

describe('ensureAuthOptions', () => {
  test(`required fields in options are not changed`, () => {
    const actualResult = ensureAuthOptions(options);

    expect(actualResult.signIn).toBe(options.signIn);
    expect(actualResult.refreshToken).toBe(options.refreshToken);
    expect(actualResult.getUser).toBe(options.getUser);
  });

  test(`default values for optional fields are added`, () => {
    const actualResult = ensureAuthOptions(options);
    const authManagerMock =
      jest.createMockFromModule<IAuthManager<unknown, unknown>>('../../auth-manager');

    expect(actualResult.signOut).toBeDefined();
    expect(actualResult.signOut(authManagerMock)).toEqual(Promise.resolve());
    expect(actualResult.buildAuthorizationHeader).toBeDefined();
    expect(actualResult.storage).toBeDefined();
    expect(actualResult.storageKeys).toBeDefined();
    expect(actualResult.axiosInstance).toBeDefined();
  });

  describe.each(buildAuthorizationHeaderTestCases)(
    'default buildAuthorizationHeader value is returning Bearer auth header',
    ({ manager, expected }) => {
      test(`token ${manager.getAccessToken()} results in ${expected} header`, () => {
        const ensuredOptions = ensureAuthOptions(options);
        expect(ensuredOptions.buildAuthorizationHeader(manager)).toBe(
          manager.getAccessToken() ? `Bearer ${manager.getAccessToken()}` : null,
        );
      });
    },
  );
});
