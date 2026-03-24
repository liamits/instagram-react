const Joi = require('joi');

const createStory = {
  body: Joi.object({
    image: Joi.string().uri().required(),
  }),
};

module.exports = { createStory };
