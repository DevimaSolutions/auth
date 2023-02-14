import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { authRetryAxiosRequestConfigFlag } from '../constants';

import RefreshTokenHandler from './refresh-token-handler';

import type { IRefreshTokenHandlerParams } from './types';
import type { AxiosError } from 'axios';

const getAxiosMockUnauthorized = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });
  mock.onGet('/').reply(401);
  return instance;
};
const getAxiosMockForbidden = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });
  mock.onGet('/').reply(403);
  return instance;
};
const getAxiosMockAuthRefreshConcurrent = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });
  mock.onGet('/').reply((config) => {
    const isRetryRequest = config.internalData?.[authRetryAxiosRequestConfigFlag];
    return [isRetryRequest ? 200 : 401, {}];
  });
  return instance;
};
const getAxiosMockAuthRefresh = () => {
  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 10 });
  mock.onGet('/').replyOnce(401).onGet('/').reply(200);
  return instance;
};

const getDefaultRefreshTokenHandlerOptions = (
  overrides?: Partial<IRefreshTokenHandlerParams<unknown, unknown>>,
) => ({
  axiosInstance: axios,
  forceRefreshToken: jest.fn(async () => {
    await new Promise((res) => setTimeout(res, 50));
  }),
  getAuthorizationHeader: jest.fn(() => 'Bearer test-token'),
  isSignedIn: jest.fn(() => true),
  signOut: jest.fn(),
  ...overrides,
});

describe('RefreshTokenHandler', () => {
  test(`should add interceptor in constructor`, () => {
    const spy = jest.spyOn(axios.interceptors.response, 'use');

    const refreshTokenHandler = new RefreshTokenHandler(getDefaultRefreshTokenHandlerOptions());

    expect(spy).toHaveBeenCalled();
    refreshTokenHandler.dispose();
  });

  test(`should refresh token on 401 axios error`, async () => {
    const axiosInstance = getAxiosMockUnauthorized();
    const options = getDefaultRefreshTokenHandlerOptions({ axiosInstance });

    new RefreshTokenHandler(options);
    await axiosInstance.get('/').catch((e: AxiosError) => {
      expect(e.response?.status).toBe(401);
    });
    expect(options.forceRefreshToken).toBeCalled();
    expect(options.signOut).toBeCalled();
  });
  test(`should reject request for signed out user`, async () => {
    const axiosInstance = getAxiosMockUnauthorized();
    const options = getDefaultRefreshTokenHandlerOptions({
      axiosInstance,
      isSignedIn: () => false,
      getAuthorizationHeader: () => null,
    });

    new RefreshTokenHandler(options);
    await axiosInstance.get('/').catch((e) => {
      const isErrorResponse = axios.isAxiosError(e);

      expect(isErrorResponse).toBeTruthy();
      expect(options.forceRefreshToken).not.toBeCalled();
      if (isErrorResponse) {
        expect(e.response?.status).toBe(401);
      }
    });
  });
  test(`should reject request when auth header is not set for authorized user`, async () => {
    const axiosInstance = getAxiosMockUnauthorized();
    const options = getDefaultRefreshTokenHandlerOptions({
      axiosInstance,
      getAuthorizationHeader: () => null,
    });

    new RefreshTokenHandler(options);
    await axiosInstance.get('/').catch((e: AxiosError) => {
      expect(e.response?.status).toBe(401);
    });
  });
  test(`should reject request with error status code other that 401`, async () => {
    const axiosInstance = getAxiosMockForbidden();
    const options = getDefaultRefreshTokenHandlerOptions({ axiosInstance });
    new RefreshTokenHandler(options);

    await axiosInstance.get('/').catch((e) => {
      const isErrorResponse = axios.isAxiosError(e);

      expect(isErrorResponse).toBeTruthy();
      expect(options.forceRefreshToken).not.toBeCalled();
      if (isErrorResponse) {
        expect(e.response?.status).toBe(403);
      }
    });
  });
  test(`should successfully refresh token`, async () => {
    const axiosInstance = getAxiosMockAuthRefresh();
    const options = getDefaultRefreshTokenHandlerOptions({ axiosInstance });
    new RefreshTokenHandler(options);

    const actualResponse = await axiosInstance.get('/');

    expect(actualResponse.status).toBe(200);
    expect(options.forceRefreshToken).toBeCalled();
  });
  test(`should use single token update on 401 error from multiple requests`, async () => {
    const concurrentRequests = 3;
    const axiosInstance = getAxiosMockAuthRefreshConcurrent();
    const options = getDefaultRefreshTokenHandlerOptions({ axiosInstance });
    new RefreshTokenHandler(options);

    const actualResponses = await Promise.all(
      Array(concurrentRequests).fill(axiosInstance.get('/')),
    );

    actualResponses.forEach((actualResponse) => {
      expect(actualResponse.status).toBe(200);
    });
    expect(options.forceRefreshToken).toBeCalledTimes(1);
  });

  test(`should remove interceptor on dispose`, async () => {
    const axiosInstance = getAxiosMockUnauthorized();
    const spy = jest.spyOn(axiosInstance.interceptors.response, 'eject');

    const options = getDefaultRefreshTokenHandlerOptions({ axiosInstance });

    const refreshTokenHandler = new RefreshTokenHandler(options);
    refreshTokenHandler.dispose();
    expect(spy).toHaveBeenCalledTimes(1);
    // Second call of dispose should be ignored
    refreshTokenHandler.dispose();
    expect(spy).toHaveBeenCalledTimes(1);
    await axiosInstance.get('/').catch(() => {});

    expect(options.forceRefreshToken).not.toBeCalled();
  });

  test(`should update authorization header `, () => {
    const testHeader = 'Bearer test-token';
    const refreshTokenHandler = new RefreshTokenHandler(getDefaultRefreshTokenHandlerOptions());

    expect(axios.defaults.headers.common.authorization).toBeUndefined();
    refreshTokenHandler.updateAuthHeader(testHeader);
    expect(axios.defaults.headers.common.authorization).toBe(testHeader);
    refreshTokenHandler.updateAuthHeader(null);
    expect(axios.defaults.headers.common.authorization).toBeUndefined();
  });
});
