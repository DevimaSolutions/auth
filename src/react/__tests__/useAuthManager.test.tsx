import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { getAuthOptions } from '../../__mocks__';
import AuthProvider from '../AuthProvider';
import { useAuthManager } from '../useAuthManager';

const TestingContextComponent = () => {
  const authManager = useAuthManager<{ id: number }>();
  return (
    <>
      <p data-testid="isManagerInitialized">{authManager === null ? 'false' : 'true'}</p>
    </>
  );
};

describe('useAuthManager', () => {
  test('provides expected AuthManager obj', async () => {
    act(() => {
      render(
        <AuthProvider config={getAuthOptions()}>
          <TestingContextComponent />
        </AuthProvider>,
      );
    });
    let isManagerInitialized = screen.getByTestId('isManagerInitialized').textContent;

    expect(isManagerInitialized).toBe('false');

    await waitFor(() => {
      // provider should initialize auth manager
      expect(screen.getByTestId('isManagerInitialized').textContent).toBe('true');
    });

    isManagerInitialized = screen.getByTestId('isManagerInitialized').textContent;
    expect(isManagerInitialized).toBe('true');
  });
});
