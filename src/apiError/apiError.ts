export default class ApiError extends Error {
  public readonly response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}
