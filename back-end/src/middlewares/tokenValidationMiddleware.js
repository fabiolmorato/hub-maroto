const jwt = require('jsonwebtoken');

const InvalidDataError = require('../errors/InvalidDataError');
const InvalidTokenError = require('../errors/InvalidTokenError');

async function tokenValidationMiddleware (req, _res, next) {
  const header = req.header('Authorization');
  if (!header) throw new InvalidDataError('Header', ['Missing Authorization Header']);

  const token = header.split('Bearer ')[1];
  if (!token) throw new InvalidDataError('Header', ['Authorization header must be on format "Bearer <token>"']);

  try {
    const data = jwt.verify(token, process.env.JWT_SIGN_SECRET);
    const { candidateId } = data;

    req.session = data;
    next();
  } catch (err) {
    throw new InvalidTokenError();
  }
}

module.exports = tokenValidationMiddleware;
