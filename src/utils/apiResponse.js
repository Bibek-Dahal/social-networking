class ApiResponse {
  constructor({ message, success, data, statusCode, errors }) {
    this.message = message;
    this.success = success;
    if (data != null) {
      this.data = data;
    }
    success = statusCode < 400;
    if (errors != null) {
      this.errors = errors;
    }
  }
}
