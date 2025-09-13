const { Content, Availability, Admin } = require('../models');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/env');

const seedDatabase = async () => {
  try {
    // Create admin user if not exists
    const adminExists = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!adminExists) {
      await Admin.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'superadmin'
      });
      console.log('Admin user created');
    }

    // Sample content data
    const sampleContent = [
      {
        type: 'movie',
        title: 'The Shawshank Redemption',
        slug: 'the-shawshank-redemption',
        description: 'Two imprisoned men bond over a number of years...',
        releaseDate: new Date('1994-09-23'),
        runtime: 142,
        genres: ['Drama'],
        rating: 9.3,
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
        posterUrl: 'https://example.com/posters/shawshank.jpg',
        backdropUrl: 'https://example.com/backdrops/shawshank.jpg',
        tags: ['prison', 'hope', 'friendship']
      },
      // Add more sample content as needed
    ];

    // Insert sample content if database is empty
    const contentCount = await Content.countDocuments();
    if (contentCount === 0) {
      const insertedContent = await Content.insertMany(sampleContent);
      
      // Add availability for sample content
      await Availability.insertMany([
        {
          contentId: insertedContent[0]._id,
          label: 'Official Streaming',
          quality: '1080p',
          language: 'English',
          sourceType: 'Official',
          url: 'https://official-streaming-service.com/movie/123'
        },
        // Add more availability entries as needed
      ]);
      
      console.log('Database seeded with sample content');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;