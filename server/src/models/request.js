// models/request.js
const mongoose = require('mongoose');

const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'duplicate', 'fulfilled'];

const requestSchema = new mongoose.Schema(
  {
    contentName: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfRelease: {
      type: Number,
      required: true,
      min: 1888, // first film year
      max: new Date().getFullYear() + 5, // allow near-future
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'webseries', 'anime'],
      required: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    createdIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// avoid duplicate requests (same content)
requestSchema.index(
  { contentName: 1, yearOfRelease: 1, contentType: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }, // case insensitive
  }
);

// for admin filters
requestSchema.index({ status: 1, createdAt: -1 });

requestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Request = mongoose.model('Request', requestSchema);
Request.STATUSES = REQUEST_STATUSES;

module.exports = Request;
