import { AuthBase } from '../authBase';
import type { IAuth, IAuthOptions } from '../types';

export class Auth extends AuthBase {
  private static _instance: Auth;

  static initialize(options: IAuthOptions): IAuth {
    if (Auth._instance) {
      Auth._instance.dispose();
    }

    Auth._instance = new Auth(options);
    return Auth._instance;
  }

  static getInstance(): IAuth {
    if (!Auth._instance) {
      throw new Error('Auth is not initialized!');
    }

    return Auth._instance;
  }

  static get isInitialized() {
    return Boolean(Auth._instance);
  }
}
