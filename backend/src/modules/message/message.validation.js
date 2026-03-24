const Joi = require('joi');

const sendMessage = {
  body: Joi.object({
    message: Joi.string().min(1).required(),
  }),
};

module.exports = { sendMessage };
