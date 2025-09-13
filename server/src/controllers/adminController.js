const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { JWT_SECRET } = require('../config/env');
const Admin = require('../models/admin');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      throw createError.Unauthorized('Invalid email or password');
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) throw createError.NotFound('Admin not found');
    
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getProfile };