const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  label: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K', null],
    default: null
  },
  language: {
    type: String,
    required: true
  },
  size: {
    type: String // e.g., "1.2GB"
  },
  sourceType: {
    type: String,
    enum: ['Official', 'SelfHosted', 'TelegramBot'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  region: {
    type: String
  },
  licenseNote: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Availability', availabilitySchema);