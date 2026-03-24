const Joi = require('joi');

const createPost = {
  body: Joi.object({
    image: Joi.string().uri().required(),
    caption: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
  }),
};

const addComment = {
  body: Joi.object({
    text: Joi.string().min(1).required(),
  }),
};

module.exports = { createPost, addComment };
