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
  errors;

  constructor(message = 'Something went wrong') {
    this.success = false;
    this.errors = {};

    // Ensure `errors.message` is always an array
    this.errors.message = Array.isArray(message) ? message : [message];
  }
}
