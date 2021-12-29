export type IAuthResult = {
  accessToken: string;
  refreshToken: string;
};

export interface ISignedInOptions<IsSignedIn extends boolean> {
  isSignedIn: boolean;
  accessToken: IsSignedIn extends false ? null : string;
  refreshToken: IsSignedIn extends false ? null : string;
}
