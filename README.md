# @devimasolutions/auth

## Installation

```sh
npm install @devimasolutions/auth
```

## Usage

Prepare options for initialization

```ts
// create-auth-options.ts

// Create an options object.
// You can use the one below as an example.

export interface IUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

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
  signOut: (manager) => manager.axios.post('/auth/sign-out'),
  refreshToken: (manager) =>
    manager.axios.post('/auth/refresh', { refreshToken: manager.getRefreshToken() }),
  getUser: (manager) => manager.axios.get('/user'),
};
```

Create `AuthManager` instance

```ts
// auth-manager.ts

import auth, { IAuthManager } from '@devimasolutions/auth';
import createAuthOptions, { ISignInParams, IUser } from './create-auth-options';

// Create a singleton to use in any part of your project
export let authManager: IAuthManager<IUser, ISignInParams> | null = null;

export const getAuthManager = async () => {
  if (authManager) {
    return authManager;
  }
  authManager = await auth.initAuth(createAuthOptions());
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

## Live updates with wml

[WML](https://github.com/wix/wml) is used to perform live mapping of library
into the `node_modules` of the dependent project.

```
# You need to add a link only once
wml add ./ ~/dependent-project/node_modules/@devimasolutions/auth

wml start
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT License](https://gitlab.com/devima.solutions/auth/auth/-/blob/main/LICENCE.md)
