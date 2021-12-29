import { isClientErrorStatusCode } from '../api';

const testCases = [
  {
    statusCode: 400,
    expected: true,
  },
  {
    statusCode: 499,
    expected: true,
  },
  {
    statusCode: 399,
    expected: false,
  },
  {
    statusCode: 500,
    expected: false,
  },
  {
    statusCode: undefined,
    expected: false,
  },
  {
    statusCode: NaN,
    expected: false,
  },
];

describe('isClientErrorStatusCode', () => {
  testCases.forEach(({ statusCode, expected }) => {
    test(`${statusCode} is ${expected ? '' : 'not '}client error status code`, () => {
      const actualResult = isClientErrorStatusCode(statusCode);
      expect(actualResult).toBe(expected);
    });
  });
});
