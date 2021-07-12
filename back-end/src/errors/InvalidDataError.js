class InvalidDataError extends Error {
  constructor (message, details) {
    super(message);

    this.details = details;
    this.name = 'InvalidDataError';
  }
}

module.exports = InvalidDataError;
