import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const getTokenData = (token?: string) => {
  if (!token) {
    return {
      userId: null,
      expiresAt: null,
    };
  }

  const [userId, expiresAtHex] = token.split('|');
  const expiresAtTimestamp = parseInt(expiresAtHex, 16);

  return {
    userId: parseInt(userId) || null,
    expiresAt: expiresAtTimestamp ? new Date(expiresAtTimestamp) : null,
  };
};

export const createToken = (userId: number, lifetime = 300) => {
  return userId + '|' + (new Date().getTime() + lifetime).toString(16);
};

export const getApiMock = () => {
  const users = [
    {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe',
    },
  ];

  const instance = axios.create();
  const mock = new MockAdapter(instance, { delayResponse: 50 });

  mock.onPost('/sign-in').reply((config) => {
    const { email } = JSON.parse(config.data);

    const user = users.find((u) => u.email === email);

    if (!user) {
      return [400, { message: 'Invalid email' }];
    }

    return [200, { accessToken: createToken(user.id), refreshToken: createToken(user.id, 1000) }];
  });
  mock.onPost('/refresh').reply((config) => {
    const { token } = JSON.parse(config.data);
    const { expiresAt, userId } = getTokenData(token);
    if (!userId || !expiresAt || expiresAt < new Date()) {
      return [401, 'Unauthorized'];
    }

    return [200, { accessToken: createToken(userId), refreshToken: createToken(userId, 1000) }];
  });
  mock.onGet('/user').reply((config) => {
    const token = config.headers?.authorization;
    const { expiresAt, userId } = getTokenData(token?.toString());

    if (!userId || !expiresAt || expiresAt < new Date()) {
      return [401, 'Unauthorized'];
    }

    return [200, users.find((u) => u.id === userId)];
  });
  mock.onGet('/food').reply((config) => {
    const token = config.headers?.authorization;
    const { expiresAt, userId } = getTokenData(token?.toString());

    if (!userId || !expiresAt || expiresAt < new Date()) {
      return [401, 'Unauthorized'];
    }

    return [200, ['Pancakes', 'Donuts', 'Croissants']];
  });
  mock.onGet('/cards').reply((config) => {
    const token = config.headers?.authorization;
    const { expiresAt, userId } = getTokenData(token?.toString());

    if (!userId || !expiresAt || expiresAt < new Date()) {
      return [401, 'Unauthorized'];
    }

    return [200, ['Dodge', 'Mazda', 'Ford']];
  });

  return instance;
};
