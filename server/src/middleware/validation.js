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

// NEW: Request create schema (for public users)
const requestCreateSchema = Joi.object({
  contentName: Joi.string().trim().required(),
  yearOfRelease: Joi.number()
    .integer()
    .min(1888)
    .max(new Date().getFullYear() + 5)
    .required(),
  requestedBy: Joi.string().trim().required(),
  contentType: Joi.string().valid('movie', 'webseries', 'anime').required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

// NEW: Request update schema (for admins only)
const requestUpdateSchema = Joi.object({
  contentName: Joi.string().trim(),
  yearOfRelease: Joi.number()
    .integer()
    .min(1888)
    .max(new Date().getFullYear() + 5),
  requestedBy: Joi.string().trim(),
  contentType: Joi.string().valid('movie', 'webseries', 'anime'),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'duplicate', 'fulfilled'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  adminNotes: Joi.string().allow('', null),
}).min(1); // at least one field

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
  validateAdminLogin: validate(adminLoginSchema),
  validateRequestCreate: validate(requestCreateSchema),
  validateRequestUpdate: validate(requestUpdateSchema),
};