import { AuthBase } from 'src/authBase';
import type { IAuth, IAuthOptions } from 'src/types';

export class Auth extends AuthBase {
  private static _instance: AuthBase;

  static initialize(options: IAuthOptions): IAuth {
    if (Auth._instance) {
      Auth._instance.dispose();
    }

    Auth._instance = new AuthBase(options);
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
