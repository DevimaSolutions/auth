export type IAuthResult = {
  accessToken: string;
  refreshToken: string;
};

export interface ISignedInOptions<IsSignedIn extends boolean, IUser> {
  isSignedIn: boolean;
  accessToken: IsSignedIn extends false ? null : string;
  refreshToken: IsSignedIn extends false ? null : string;
  user: IsSignedIn extends false ? null : IUser;
}
