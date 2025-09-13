const createError = require('http-errors');
const { Content, Availability } = require('../models');

const createContent = async (req, res, next) => {
  try {
    const content = new Content(req.body);
   const savedcontent = await content.save();
    console.log(savedcontent)
    res.status(201).json(savedcontent);
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!content) throw createError.NotFound('Content not found');
    
    res.json(content);
  } catch (error) {
    next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) throw createError.NotFound('Content not found');
    
    // Delete associated availability entries
    await Availability.deleteMany({ contentId: content._id });
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) throw createError.NotFound('Content not found');
    
    const availability = await Availability.find({ contentId: content._id });
    
    res.json({ ...content.toObject(), availability });
  } catch (error) {
    next(error);
  }
};

const getAllContent = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10, sort = '-releaseDate', q } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (q) query.$text = { $search: q };

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      select: '-__v',
      collation: { locale: 'en' }
    };

    // Execute paginated query
    const result = await Content.paginate(query, options);

    // Format response
    const response = {
      contents: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// In your contentController.js
const searchContent = async (req, res, next) => {
  const { q, type } = req.query;

  // Minimum 3 characters validation
  if (!q || typeof q !== 'string' || q.trim().length < 3) {
    return res.status(400).json({ 
      message: "Please provide a search query with at least 3 characters" 
    });
  }

  try {
    // Escape special regex characters
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Build regex search query
    const searchQuery = { 
      title: new RegExp(escapedQuery, "i") // case-insensitive partial match
    };

    // Add type filter if provided
    if (type && ["movie", "webseries", "anime"].includes(type)) {
      searchQuery.type = type;
    }

    const results = await Content.find(searchQuery)
      .select("title type posterUrl slug releaseDate")
      .sort({ releaseDate: -1 }) // latest first
      .limit(20);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No content found" });
    }

    res.status(200).json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all latest movies
const getAllLatestMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { releaseDate: -1 },
      select: '-__v'
    };

    const result = await Content.paginate(
      { type: 'movie' }, 
      options
    );

    const response = {
      movies: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get all web series
const getAllWebSeries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { releaseDate: -1 },
      select: '-__v'
    };

    const result = await Content.paginate(
      { type: 'webseries' }, 
      options
    );

    const response = {
      webseries: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get all anime
const getAllAnime = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { releaseDate: -1 },
      select: '-__v'
    };

    const result = await Content.paginate(
      { type: 'anime' }, 
      options
    );

    const response = {
      anime: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get content by type (generic function)
const getContentByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20, sort = '-releaseDate' } = req.query;
    
    // Validate content type
    if (!['movie', 'webseries', 'anime'].includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      select: '-__v'
    };

    const result = await Content.paginate({ type }, options);

    const response = {
      contents: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages,
      type
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createContent,
  updateContent,
  deleteContent,
  getContentById,
  getAllContent,
  searchContent,
  getAllLatestMovies,
  getAllWebSeries,
  getAllAnime,
  getContentByType
};