const InvalidDataError = require('../errors/InvalidDataError');

function schemaValidationMiddleware (schema, field = 'body', options = { abortEarly: false }) {
  return function (req, _res, next) {
    const data = field === 'headers'
      ? req.rawHeaders.reduce((acc, val, index) => (index % 2 === 0 && (acc[val] = req.rawHeaders[index + 1]), acc), {})
      : req[field];
    
    const validation = schema.validate(data, { abortEarly: options.abortEarly });

    if (validation.error) {
      throw new InvalidDataError(
        `Invalid ${field}`,
        validation.error.details.map(e => e.message)
      );
    }

    next();
  };
}

module.exports = schemaValidationMiddleware;
