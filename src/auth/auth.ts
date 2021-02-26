import { AuthBase } from 'src/authBase';
import type { IAuthOptions } from 'src/types';

export class Auth extends AuthBase {
  private static _instance: Auth | null;

  static initialize(options: IAuthOptions) {
    if (Auth._instance) {
      Auth._instance.dispose();
    }

    Auth._instance = new Auth(options);
    return Auth._instance;
  }

  static getInstance() {
    if (!Auth._instance) {
      throw new Error('Auth is not initialized!');
    }

    return Auth._instance;
  }

  static get isInitialized() {
    return Boolean(Auth._instance);
  }
}
