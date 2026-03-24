const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 * @param {Object} schema - { body?, query?, params? }
 */
const validate = (schema) => (req, res, next) => {
  const targets = ['body', 'query', 'params'];
  for (const key of targets) {
    if (!schema[key]) continue;
    const { error } = schema[key].validate(req[key], { abortEarly: false, allowUnknown: true });
    if (error) {
      const msg = error.details.map(d => d.message).join(', ');
      return next(new ApiError(400, msg));
    }
  }
  next();
};

module.exports = validate;
