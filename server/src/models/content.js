const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['movie', 'webseries', 'anime'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number // in minutes
  },
  genres: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  director: {
    type: String
  },
  cast: {
    type: [String]
  },
  posterUrl: {
    type: String,
    required: true
  },
  backdropUrl: {
    type: String
  },
  tags: {
    type: [String]
  }
}, { timestamps: true });

// Add pagination plugin
contentSchema.plugin(mongoosePaginate);

// Indexes for search
contentSchema.index({ title: 'text', tags: 'text' });
contentSchema.index({ type: 1, releaseDate: -1 });

module.exports = mongoose.model('Content', contentSchema);