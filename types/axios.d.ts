/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import axios from 'axios';

declare module 'axios' {
  type OriginalAxiosError = import('axios').AxiosError;
  type OriginalAxiosRequestConfig = import('axios').AxiosRequestConfig;
  export interface AxiosRequestConfig<D = any, I = Record<string, string | number | boolean>>
    extends OriginalAxiosRequestConfig<D> {
    internalData?: I;
  }

  export interface AxiosError<T = any, D = any> extends OriginalAxiosError<T, D> {
    config: AxiosRequestConfig<D>;
  }
}
