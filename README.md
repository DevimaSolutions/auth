# o-auth



## Installation

```sh
npm install @DevimaSolutions/o-auth
```

## Usage

```js
import axios from 'axios'
import OAuth, { IAuthOptions } from '@DevimaSolutions/o-auth'

// Create an options object.
// You can use the one below as an example.

const axiosInstance = axios.create({
  baseURL: 'https://my-app.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const oAuthOptions: IAuthOptions = {
  axiosInstance,
  signIn: async (email: string, password: string) =>
    axiosInstance.post('/auth/login', {
      grand_type: 'password',
      email,
      password,
      scope: 'web_manager',
    }),
  signOut: async (): Promise<void> =>
    axiosInstance.post(
      '/auth/logout',
      {},
    ),
  refreshToken: async (refresh_token: string) =>
    axiosInstance.post('/auth/login', {
      grand_type: 'refresh',
      refresh_token,
    }),
  getUser: async (accessToken: string) =>
    axiosInstance.get('/user', {
      headers: {
        authorization: accessToken,
      },
    }),
}

// Pass options first time to initialize
OAuth(oAuthOptions)

await OAuth()
  .signIn('user@example.com', 'secret')
  .catch((e) => {
    const { response } = e
    // ...
    // Handle API errors here
  })
// Then just call the OAuth function to get oAuth object
// You can also wait for an active action to finish
OAuth().oncePendingActionComplete(() => {
  OAuth()
    .signIn('user@example.com', 'secret-password')
    .catch((e) => {
      const { response } = e
      // ...
      // Handle API errors here
    })
  console.log(OAuth())
})

// Here you are already logged in if no error was thrown.
// So you can make authenticated calls.
const response = await OAuth().axios.put('user/change-password', {
  password: 'secret2'
})
```


## Socket usage

```javascript

async function createSocketSubscription() {
  const socket = await OAuth().socketManager.createSocketConnection(
    'https://socket.greenparc.devima.tech',
    'notes',
    '318',
  )

  socket.on('rooms-updated', (roomChanges) => {
    //  Handle event
  })

  socket.on('connection-error', () => {
    // Handle connection error
  })

  return () => {
    OAuth().socketManager.disconnect(socket)
  }
}
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
