import { Auth, IAuth, IAuthOptions } from './auth';

export default (options?: IAuthOptions): IAuth => {
  return Auth.getInstance(options);
};
