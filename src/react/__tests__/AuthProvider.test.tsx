import { act, render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

import { createToken, getAuthOptions } from '../../__mocks__';
import { defaultAuthStorageKeys } from '../../constants';
import { MemoryStorage } from '../../storage';
import { getAuthFactory, getAuthManager } from '../auth-factory';
import AuthProvider from '../AuthProvider';
import { useAuthContext } from '../useAuthContext';

import type { IUser } from '../../__mocks__';

const TestingContextComponent = () => {
  const { isLoading, user, accessToken, refreshToken, isSignedIn } = useAuthContext<IUser>();
  return (
    <>
      <p data-testid="isLoading">{isLoading.toString()}</p>
      <p data-testid="userId">{user?.id}</p>
      <p data-testid="accessToken">{accessToken}</p>
      <p data-testid="refreshToken">{refreshToken}</p>
      <p data-testid="isSignedIn">{isSignedIn.toString()}</p>
    </>
  );
};

const AuthProviderWrapperComponent = () => {
  const [config, setConfig] = useState(getAuthOptions());
  useEffect(() => {
    //  update config state to force auth provider dispose uninitialized auth manager and create a new one
    setConfig(getAuthOptions());
  }, []);
  return (
    <AuthProvider config={config}>
      <TestingContextComponent />
    </AuthProvider>
  );
};

const getAuthDataByTestId = () => {
  return {
    isLoading: screen.getByTestId('isLoading').textContent,
    userId: screen.getByTestId('userId').textContent,
    accessToken: screen.getByTestId('accessToken').textContent,
    refreshToken: screen.getByTestId('refreshToken').textContent,
    isSignedIn: screen.getByTestId('isSignedIn').textContent,
  };
};

describe('<AuthProvider />', () => {
  beforeEach(() => {
    getAuthFactory().disposeAuthManager();
    getAuthFactory().setGlobalAuthOptions(null);
  });
  test('provides expected AuthContext obj to child elements when authorized', async () => {
    // set auth token to emulate situation when user authorized on application mount
    const storage = new MemoryStorage();
    const accessToken = createToken(1, 100000);
    const refreshToken = createToken(1, 100000);
    storage.setItem(defaultAuthStorageKeys.accessToken, accessToken);
    storage.setItem(defaultAuthStorageKeys.refreshToken, refreshToken);

    render(
      <AuthProvider config={{ ...getAuthOptions(), storage }} refreshTokenOnInit>
        <TestingContextComponent />
      </AuthProvider>,
    );

    const authDataOnMount = getAuthDataByTestId();

    const expectedOnMount = {
      isLoading: 'true',
      userId: '',
      accessToken: '',
      refreshToken: '',
      isSignedIn: 'false',
    };

    expect(authDataOnMount).toEqual(expectedOnMount);

    await waitFor(() => {
      // provider should initialize auth manager
      expect(screen.getByTestId('isSignedIn')?.textContent).toBe('true');
    });

    const authDataAfterInit = getAuthDataByTestId();
    expect(authDataAfterInit.isLoading).toBe('false');
    expect(authDataAfterInit.userId).toBe('1');
    expect(authDataAfterInit.isSignedIn).toBe('true');
    expect(authDataAfterInit.accessToken).toMatch(/^1|(a-f0-9){11}$/);
    expect(authDataAfterInit.refreshToken).toMatch(/^1|(a-f0-9){11}$/);
  });
  test('provides expected AuthContext obj to child elements when unauthorized', async () => {
    render(
      <AuthProvider config={getAuthOptions()}>
        <TestingContextComponent />
      </AuthProvider>,
    );

    const authDataOnMount = getAuthDataByTestId();

    const expectedOnMount = {
      isLoading: 'true',
      userId: '',
      accessToken: '',
      refreshToken: '',
      isSignedIn: 'false',
    };

    expect(authDataOnMount).toEqual(expectedOnMount);

    await waitFor(() => {
      // provider should initialize auth manager
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });

    const expectedAfterInit = {
      isLoading: 'false',
      userId: '',
      accessToken: '',
      refreshToken: '',
      isSignedIn: 'false',
    };
    const authDataAfterInit = getAuthDataByTestId();
    expect(authDataAfterInit).toEqual(expectedAfterInit);
  });
  test('updates auth values on sign in', async () => {
    render(
      <AuthProvider config={getAuthOptions()}>
        <TestingContextComponent />
      </AuthProvider>,
    );

    const authDataOnMount = getAuthDataByTestId();

    const expectedOnMount = {
      isLoading: 'true',
      userId: '',
      accessToken: '',
      refreshToken: '',
      isSignedIn: 'false',
    };

    expect(authDataOnMount).toEqual(expectedOnMount);

    const authManager = await getAuthManager();
    await act(() => authManager.signIn({ email: 'test@example.com' }));

    const authData = authManager.getAuthData();

    await waitFor(() => {
      // provider should initialize auth manager
      expect(screen.getByTestId('userId').textContent).toBe('1');
    });

    const expectedAfterInit = {
      isLoading: 'false',
      userId: '1',
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      isSignedIn: 'true',
    };
    const authDataAfterInit = getAuthDataByTestId();
    expect(authDataAfterInit).toEqual(expectedAfterInit);
  });
  test('disposes AuthManager when new config is passed', async () => {
    const initialDisposeAuthManager = getAuthFactory().disposeAuthManager;
    getAuthFactory().disposeAuthManager = jest.fn(() => initialDisposeAuthManager());

    render(<AuthProviderWrapperComponent />);

    await waitFor(() => {
      // provider should initialize auth manager
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });
    const authManager = await getAuthManager();

    expect(getAuthFactory().disposeAuthManager).toBeCalledTimes(2);
    expect(authManager.isDisposed()).toBe(false);
  });
});
