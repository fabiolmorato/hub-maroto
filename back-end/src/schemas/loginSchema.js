const joi = require('joi');

const schema = joi.object({
  username: joi.string().required(),
  password: joi.string().required()
});

module.exports = schema;
