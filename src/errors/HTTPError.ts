export default class HttpError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
  }
}
