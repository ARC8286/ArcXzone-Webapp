const createError = require('http-errors');
const { Content, Availability } = require('../models');

// Add this new function to get availability list
const getAvailability = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) throw createError.NotFound('Content not found');
    
    const availability = await Availability.find({ contentId: req.params.id });
    
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

const addAvailability = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) throw createError.NotFound('Content not found');
    
    const availability = new Availability({
      contentId: content._id,
      ...req.body
    });
    
    await availability.save();
    
    res.status(201).json(availability);
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOneAndUpdate(
      { _id: req.params.availabilityId, contentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!availability) throw createError.NotFound('Availability entry not found');
    
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.availabilityId,
      contentId: req.params.id
    });
    
    if (!availability) throw createError.NotFound('Availability entry not found');
    
    res.json({ message: 'Availability entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
};