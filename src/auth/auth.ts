import AuthBase from '../authBase';
import type { IAuth, IAuthOptions, ISignedInOptions } from '../types';

export default class Auth extends AuthBase {
  private static _instance: Auth;

  static initialize(options: IAuthOptions): IAuth {
    if (Auth._instance) {
      Auth._instance.dispose();
    }

    Auth._instance = new Auth(options);
    return Auth._instance;
  }

  static hydrate(
    options: IAuthOptions,
    signedInOptions: ISignedInOptions
  ): IAuth {
    if (Auth._instance) {
      Auth._instance.dispose();
    }

    Auth._instance = new Auth(options, signedInOptions);
    return Auth._instance;
  }

  static getInstance(): IAuth {
    if (!Auth._instance) {
      throw new Error('Auth is not initialized!');
    }

    return Auth._instance;
  }

  static get isInitialized(): boolean {
    return Boolean(Auth._instance);
  }
}
