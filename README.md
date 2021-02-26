# o-auth



## Installation

```sh
npm install @DevimaSolutions/o-auth
```

## Usage

```js
import OAuth from '@DevimaSolutions/o-auth';

// Pass options first time to initialize

const oAuth = OAuth({
  loginUrl: 'http://localhost/auth',
  logoutUrl: 'http://localhost/logout',
  refreshTokenUrl: 'http://localhost/auth/token/refresh'
});

// Then just call function to get oAuth object

const oAuth = OAuth();
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
