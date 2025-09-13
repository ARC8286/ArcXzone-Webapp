const Joi = require('joi');
const createError = require('http-errors');

const contentSchema = Joi.object({
  type: Joi.string().valid('movie', 'webseries', 'anime').required(),
  title: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  releaseDate: Joi.date().required(),
  runtime: Joi.number().integer().min(1),
  genres: Joi.array().items(Joi.string()).min(1).required(),
  rating: Joi.number().min(0).max(10),
  director: Joi.string(),
  cast: Joi.array().items(Joi.string()),
  posterUrl: Joi.string().uri().required(),
  backdropUrl: Joi.string().uri(),
  tags: Joi.array().items(Joi.string())
});

const availabilitySchema = Joi.object({
  label: Joi.string().required(),
  quality: Joi.string().valid('480p', '720p', '1080p', '4K').allow(null),
  language: Joi.string().required(),
  size: Joi.string(),
  sourceType: Joi.string().valid('Official', 'SelfHosted', 'TelegramBot').required(),
  url: Joi.string().uri().required(),
  region: Joi.string(),
  licenseNote: Joi.string()
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return next(createError.BadRequest(error.details[0].message));
  }
  next();
};


module.exports = {
  validateContent: validate(contentSchema),
  validateAvailability: validate(availabilitySchema),
  validateAdminLogin: validate(adminLoginSchema)
};