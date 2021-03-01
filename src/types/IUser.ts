export type AdditionalPayloadValue = string | number | string[] | number[];
export interface IUser {
  id: string;
  email: string;
  [key: string]: AdditionalPayloadValue;
}

export interface IAuthResult {
  access_token: string;
  refresh_token: string;
  [key: string]: AdditionalPayloadValue;
}
