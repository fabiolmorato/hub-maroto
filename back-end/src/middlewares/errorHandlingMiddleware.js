const InvalidDataError = require("../errors/InvalidDataError");
const InvalidTokenError = require("../errors/InvalidTokenError");
const AuthenticationError = require("../errors/AuthenticationError");

/* eslint-disable-next-line no-unused-vars */
function errorHandlingMiddleware(error, _req, res, _next) {
  if (error instanceof InvalidDataError)
    return res.status(422).send({
      error: error.message,
      details: error.details,
    });

  if (error instanceof InvalidTokenError)
    return res.status(401).send({
      error: error.message,
    });
  
  if (error instanceof AuthenticationError)
    return res.status(401).send({
      error: error.message
    });

  console.log(error);

  return res.status(500).json({
    error: "Internal server error",
  });
}

module.exports = errorHandlingMiddleware;