export class SuccessApiResponse {
  success;
  constructor({ message, data = null }) {
    this.message = message;
    this.success = true;
    this.data = data;
  }
}

export class ErrorApiResponse {
  success;
  errors = {};
  constructor(message = 'Something went wrong') {
    this.errors.message = message;
    this.success = false;
  }
}
