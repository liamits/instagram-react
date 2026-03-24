const Joi = require('joi');

const updateProfile = {
  body: Joi.object({
    fullName: Joi.string().allow('').optional(),
    bio: Joi.string().allow('').optional(),
    avatar: Joi.string().uri().optional(),
  }),
};

const search = {
  query: Joi.object({
    q: Joi.string().allow('').optional(),
  }),
};

module.exports = { updateProfile, search };
