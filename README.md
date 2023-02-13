# @devimasolutions/auth

**JWT authentication is easy as never before** ☕

## Features
- Handle user sign in process
- Persist user access tokens
- Send authorized API request with no additional configuration
- Handle refresh process for expired access tokens

## Installation

```sh
npm install @devimasolutions/auth
# or using yarn
yarn add @devimasolutions/auth
```

## Usage with React

🧑‍🔬 *If you don't use React or just want to have more precise control over the library see [Usage with Typescript](#usage-with-typescript) section.*

## Usage with TypeScript

Prepare options for initialization/ Firstly you need to create
`authOptions` object that will be used to initialize the library

IAuthOptions interface have the following fields

- `signIn` *(required)* 

This parameter contain a function that is executed when `authManager.signIn` is called. It should send a request to the API to get JWT tokens pair. The API response should have the following format:
```ts
{ accessToken: string; refreshToken: string; }
```

- `signOut` *(optional)* 

```ts

  signOut(manager: IAuthManager<IUser, ISignInParams>): Promise<void>;
  refreshToken(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IAuthResult>>;
  getUser(manager: IAuthManager<IUser, ISignInParams>): Promise<AxiosResponse<IUser>>;

  // Optional parameters
  // axios instance passed here will be a base for `manager.axios` you will use further
  // usually it is enough to set base url here and content type. But if your server require
  // any additional configuration to perform api request it can be done here
  // after library initialization response interceptor will be added
  /**
   * @description axios instance passed here will be a base for `authManager.axios` you will use further
   * usually it is enough to set base url and content type here. But if your server requires
   * any additional configuration to perform api request it can be done here.
   *
   * After library initialization response interceptor will be added to this axios instance.
   * This interceptor will try to refresh the `accessToken` if user is signed in and request returned
   * 401 (Unauthorized) status code.
   * @default axios.create({ headers: { 'Content-Type': 'application/json' } })
   */
  axiosInstance?: AxiosInstance;
  storage?: IStorage;
  buildAuthorizationHeader?(manager: IAuthManager<IUser, ISignInParams>): string | null;
  storageKeys?: IStorageKeys;
}
```

Example of configuration object:

```ts
// create-auth-options.ts

// This interface represents user object that is returned
// from the getUser function once user is authorized
export interface IUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

// This interface represents parameters consumed by sign in endpoint
export interface ISignInParams {
  email: string;
  password: string;
}

export const authOptions: IAuthOptions<IUser, ISignInParams> = {
  axiosInstance: axios.create({
    baseURL: 'https://my-app.com/api',
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  signIn: (signInParams, manager) => manager.axios.post('/auth/sign-in', signInParams),
  refreshToken: (manager) =>
    manager.axios.post('/auth/refresh', { refreshToken: manager.getRefreshToken() }),
  getUser: (manager) => manager.axios.get('/profile'),
};
```

Create `AuthManager` instance

```ts
// auth-manager.ts

import AuthFactory, { IAuthManager } from '@devimasolutions/auth';
import createAuthOptions, { ISignInParams, IUser } from './create-auth-options';

// Create a singleton to use in any part of your project
export let authManager: IAuthManager<IUser, ISignInParams> | null = null;

export const getAuthManager = async () => {
  if (authManager) {
    return authManager;
  }
  authManager = await AuthFactory.createAuthManagerInstance(createAuthOptions());
  return authManager;
};

export default {
  getAuthManager,
  authManager,
};
```

```ts
// app.ts

import { getAuthManager } from './auth-manager'

const authManager = await getAuthManager();

await authManager
.signIn({email: 'user@example.com', password: 'secret'})
.catch((e) => {
  // ...
  // Handle API errors here
});


// Here you are already logged in if no error was thrown.
// So you can make authenticated calls.
const response = await authManager.axios.put('/user/change-password', {
  password: 'secret2'
})
```

## Support
- `axios`

axios is used to perform API calls. axios versions from `0.17.0` to `0.27.2` are supported.
using `axios@1.x.x` will lead to the errors when using this library.

- `react`
If you are using React components `react@16.8.0` or newer is required. The main reason is usage of Hooks in the library.

## Known issues

**Endpoint that return different data for authorized and unauthorized users**. In this case, the library will not know that the access token has expired because the authorized endpoint did not return an unauthorized response error code.
You may split the endpoints into 2 (one for public access and another one for authorized access) as a workaround.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT License](https://gitlab.com/devima.solutions/auth/auth/-/blob/main/LICENCE.md)
