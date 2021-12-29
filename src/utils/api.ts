const BAD_REQUEST_CODE = 400;

const INTERVAL_SERVER_ERROR_CODE = 500;

export const isClientErrorStatusCode = (statusCode?: number): boolean =>
  !!statusCode && statusCode >= BAD_REQUEST_CODE && statusCode < INTERVAL_SERVER_ERROR_CODE;

export default {
  isClientErrorStatusCode,
};
