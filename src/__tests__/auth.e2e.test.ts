import { authOptions } from '../__mocks__';
import auth from '../index';

describe('auth e2e', () => {
  test('Should handle authorized request properly', async () => {
    const authInstance = await auth.initAuth(authOptions);

    expect(authInstance.isSignedIn()).toBeFalsy();

    await expect(authInstance.axios.get('/food')).rejects.toThrow(
      'Request failed with status code 401',
    );

    await expect(authInstance.signIn({ email: 'error@example.com' })).rejects.toThrow(
      'Request failed with status code 400',
    );

    await authInstance.signIn({ email: 'test@example.com' });

    expect(authInstance.isSignedIn()).toBeTruthy();
    expect(authInstance.getUser()).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'John Doe',
    });

    authInstance.updateUser({ name: 'Joe Doe' });
    expect(authInstance.getUser()).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Joe Doe',
    });

    const { data } = await authInstance.axios.get('/food');
    expect(data).toEqual(['Pancakes', 'Donuts', 'Croissants']);

    // wait for access token to expire
    await new Promise((res) => setTimeout(res, 200));

    const expiredToken = authInstance.getAccessToken();

    const [foodResponse, cardsResponse] = await Promise.all([
      authInstance.axios.get('/food'),
      authInstance.axios.get('/cards'),
    ]);
    expect(foodResponse.data).toEqual(['Pancakes', 'Donuts', 'Croissants']);
    expect(cardsResponse.data).toEqual(['Dodge', 'Mazda', 'Ford']);

    const validToken = authInstance.getAccessToken();
    expect(expiredToken).not.toBe(validToken);

    // Check if new api call does not override access token
    await authInstance.axios.get('/food');
    expect(authInstance.getAccessToken()).toBe(validToken);

    // wait for refresh token to expire
    await new Promise((res) => setTimeout(res, 1000));

    // await expect(authInstance.axios.get('/food')).rejects.toThrow(
    //   'Request failed with status code 401',
    // );
  });
});
