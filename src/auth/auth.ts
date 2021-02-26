import type { IAuth, IAuthOptions } from './auth.types';

export class Auth implements IAuth {
  private static _instance: IAuth | null;

  static getInstance(options?: IAuthOptions): IAuth {
    if (!Auth._instance) {
      if (!options) {
        throw new Error('options are required when creating instance of Auth');
      }

      Auth._instance = new Auth(options);
    }

    return Auth._instance;
  }

  private readonly _options: IAuthOptions;

  get options(): IAuthOptions {
    return this._options;
  }

  constructor(options: IAuthOptions) {
    this._options = options;
  }
}
