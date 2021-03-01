# o-auth



## Installation

```sh
npm install @DevimaSolutions/o-auth
```

## Usage

```js
import OAuth, { ApiError, IAuthOptions, IAuthResult, IUser } from '@DevimaSolutions/o-auth'

const apiBaseUrl = 'https://my-app.com/api'

// Create an options object.
// You can use the one below as an example.

const oAuthOptions: IAuthOptions = {
  signIn: async (email: string, password: string) => {
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        grand_type: 'password',
        email,
        password,
      }),
    })

    // Throw ApiError instance if the request had failed.
    if (!res.ok) {
      throw new ApiError('Request failed', res)
    }

    const json = await res.json()
    // Return IAuthResult (perform mapping if needed).
    return json as IAuthResult
  },
  signOut: async (authToken: string): Promise<void> => {
    const res = await fetch(`${apiBaseUrl}/auth/logout`, {
      headers: {
        authorization: authToken,
      },
      method: 'POST',
    })

    // Throw ApiError instance if the request had failed.
    if (!res.ok) {
      throw new ApiError('Request failed', res)
    }
    // The signOut method does not require a return value.
    // If there was no error, then the signOut is considered successful.
  },
  refreshToken: async (refresh_token: string) => {
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        grand_type: 'refresh',
        refresh_token,
      }),
    })

    // Throw ApiError instance if the request had failed.
    if (!res.ok) {
      throw new ApiError('Request failed', res)
    }

    const json = await res.json()
    // Return IAuthResult (perform mapping if needed).
    return json as IAuthResult
  },
  getUser: async (authToken: string) => {
    const res = await fetch(`${apiBaseUrl}/user`, {
      headers: {
        authorization: authToken,
      },
    })

    // Throw ApiError instance if the request had failed.
    if (!res.ok) {
      throw new ApiError('Request failed', res)
    }

    const json = await res.json()
    // Return IUser object (perform mapping if needed).
    return json as IUser
  },
}

// Pass options first time to initialize
OAuth(oAuthOptions)

await OAuth()
  .signIn('user@example.com', 'secret')
  .catch((e) => {
    if (e instanceof ApiError) {
      const { response } = e
      // ...
      // Handle API errors here
    }
  })
// Then just call the OAuth function to get oAuth object
// You can also wait for an active action to finish
OAuth().oncePendingActionComplete(() => {
  OAuth()
    .signIn('admin@gmail.com', 'Repl1cat0R')
    .catch((e) => {
      if (e instanceof ApiError) {
        const { response } = e
        // ...
        // Handle API errors here
      }
    })
  console.log(OAuth())
})

// Here you are already logged in if no error was thrown.
// So you can make authenticated calls.
const response = await OAuth().fetchAuthenticated(`${apiBaseUrl}/user/change-password`, {
  method: 'PUT',
  body: JSON.stringify({ password: 'secret2' }),
})
```

## Live updates with wml

[WML](https://github.com/wix/wml) is used to perform live mapping of library
into the `node_modules` of the dependent project.

```
# You need to add a link only once
wml add ./ ~/dependent-project/node_modules/@DevimaSolutions/o-auth

wml start
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
