const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Community = require('./models/Community');
const User = require('./models/User');

dotenv.config();

const seedCommunities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding communities...');

    // Don't duplicate if already seeded
    const count = await Community.countDocuments();
    if (count > 0) {
      console.log('Communities already exist. Ending seed.');
      process.exit(0);
    }

    const firstUser = await User.findOne({});
    if (!firstUser) {
        console.log('No user exists to bind community to! Run normal flow first to register.');
        process.exit();
    }

    const sampleCommunities = [
      {
        name: 'The Next.js Mastery Hub',
        description: 'Dedicated space to discuss advanced Next.js architectures, SSR, API routes, and App router patterns.',
        category: 'Web Development',
        coverImage: 'https://images.unsplash.com/photo-1627398225058-eb568d5b8ff3?q=80&w=2000&auto=format&fit=crop',
        createdBy: firstUser._id,
        members: [firstUser._id],
        posts: [
            { user: firstUser._id, text: "Welcome to the Next.js Mastery Hub! Feel free to ask your SSR questions here.", likes: [] }
        ]
      },
      {
        name: 'UI/UX Visual Explorers',
        description: 'Where designers meet to barter critique and master Figma, Framer, and aesthetic user psychology.',
        category: 'Design',
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
        createdBy: firstUser._id,
        members: [firstUser._id],
        posts: []
      },
      {
        name: 'Startup Builders Collective',
        description: 'A place for solo-founders and indie-hackers to barter growth hacks, marketing tricks, and backend integrations.',
        category: 'Business',
        coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=2000&auto=format&fit=crop',
        createdBy: firstUser._id,
        members: [firstUser._id],
        posts: []
      }
    ];

    await Community.insertMany(sampleCommunities);
    console.log('Successfully seeded 3 dynamic communities!');
    
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedCommunities();
