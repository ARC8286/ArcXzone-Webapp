const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { JWT_SECRET } = require('../config/env');
const Admin = require('../models/admin');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw createError.Unauthorized('Authentication required');

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) throw createError.Unauthorized('Admin not found');

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(createError.Forbidden('Insufficient privileges'));
    }
    next();
  };
};

module.exports = { authenticate, authorize };