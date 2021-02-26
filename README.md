# o-auth



## Installation

```sh
npm install @DevimaSolutions/o-auth
```

## Usage

```js
import OAuth from '@DevimaSolutions/o-auth';

// ...

const result = OAuth({
  loginUrl: 'http://localhost/auth',
  logoutUrl: 'http://localhost/logout',
  refreshTokenUrl: 'http://localhost/auth/token/refresh'
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
