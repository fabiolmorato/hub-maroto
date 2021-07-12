class InvalidTokenError extends Error {
  constructor () {
    super('Given token is not valid!');

    this.name = 'InvalidTokenError';
  }
}

module.exports = InvalidTokenError;
