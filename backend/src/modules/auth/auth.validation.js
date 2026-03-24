const Joi = require('joi');

const register = {
  body: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().allow('').optional(),
  }),
};

const login = {
  body: Joi.object({
    emailOrUsername: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = { register, login };
