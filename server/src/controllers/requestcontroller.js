// controllers/requestController.js
const createError = require('http-errors');
const Request = require('../models/request');

// PUBLIC: create a new request (no auth)
const createRequest = async (req, res, next) => {
  try {
    const { contentName, yearOfRelease, requestedBy, contentType, priority } = req.body;

    const createdIp =
      (req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
      req.ip ||
      undefined;

    const request = new Request({
      contentName,
      yearOfRelease,
      requestedBy,
      contentType,
      priority,
      createdIp,
    });

    const saved = await request.save();
    return res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return next(
        createError.Conflict('This content has already been requested (duplicate request detected).')
      );
    }
    return next(err);
  }
};

// ADMIN: get all requests with filters & pagination
const getAllRequests = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 20,
      status,
      contentType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 20;
    if (limit > 100) limit = 100;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (contentType) {
      query.contentType = contentType;
    }

    if (search) {
      query.$or = [
        { contentName: { $regex: search, $options: 'i' } },
        { requestedBy: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      Request.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
      Request.countDocuments(query),
    ]);

    return res.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};

// ADMIN: get a single request
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return next(createError.NotFound('Request not found'));
    }
    return res.json(request);
  } catch (err) {
    return next(err);
  }
};

// ADMIN: update a request
const updateRequest = async (req, res, next) => {
  try {
    const updateData = {};

    const allowedFields = [
      'contentName',
      'yearOfRelease',
      'requestedBy',
      'contentType',
      'status',
      'priority',
      'adminNotes',
    ];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Request.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return next(createError.NotFound('Request not found'));
    }

    return res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return next(
        createError.Conflict('Another request already exists with same content details.')
      );
    }
    return next(err);
  }
};

// ADMIN: delete a request
const deleteRequest = async (req, res, next) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(createError.NotFound('Request not found'));
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
};
