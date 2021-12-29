import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

// You will replace it with
// import auth from '@devimasolutions/auth'
// when using the package
import type { IAuthOptions } from './@devimasolutions/auth';

export interface ISignInParams {
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
}

const tokenManager = () => {
  let issuedAccessTokenIdx = 0;
  let issuedRefreshTokenIdx = 0;
  const getRefreshToken = () => `refreshToken${++issuedRefreshTokenIdx}`;
  const getAccessToken = () => `accessToken${++issuedAccessTokenIdx}`;
  return {
    getRefreshToken,
    getAccessToken,
  };
};

const mockAxiosAuthImplementation = (axiosInstance: AxiosInstance) => {
  const { getRefreshToken, getAccessToken } = tokenManager();
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 });
  mock.onPost('/auth/login', { email: 'admin@admin.com', password: 'Test1234' }).reply(() => {
    console.log('/auth/login');
    return [
      200,
      {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
      },
    ];
  });
  mock.onPost('/auth/login').reply(400, {
    message: 'Login or password is invalid',
  });
  mock.onPost('/auth/token').reply(() => {
    console.log('/auth/token');
    return [
      200,
      {
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
      },
    ];
  });
  mock.onGet('/auth/user').reply(() => {
    console.log('/auth/user');
    return [
      200,
      {
        id: '1',
        email: 'admin@admin.com',
        name: 'Admin Admin',
      } as IUser,
    ];
  });

  mock.onGet('/data').replyOnce(() => {
    console.log('/data', 401);
    return [
      401,
      {
        message: 'Unauthorized',
      },
    ];
  });
  mock.onGet('/data').replyOnce(() => {
    console.log('/data', 401);
    return [
      401,
      {
        message: 'Unauthorized',
      },
    ];
  });
  mock.onGet('/data').reply(() => {
    console.log('/data', 200);
    return [
      200,
      {
        message: 'success',
      },
    ];
  });

  return mock;
};

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  mockAxiosAuthImplementation(instance);

  return instance;
};

const createAuthOptions = () => {
  const oAuthOptions = {
    axiosInstance: createAxiosInstance(),
    signIn: async (params, manager) => manager.axios.post('/auth/login', params),
    signOut: async () => Promise.resolve(),
    refreshToken: async (manager) =>
      manager.axios.post('/auth/token', {
        refreshToken: manager.getRefreshToken(),
      }),
    getUser: async (manager) => manager.axios.get('/auth/user'),
  } as IAuthOptions<IUser, ISignInParams>;

  return oAuthOptions;
};

export default createAuthOptions;
