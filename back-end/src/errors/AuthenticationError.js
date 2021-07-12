class AuthenticationError extends Error {
  constructor () {
    super(`User and/or passwords not found!`);

    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
